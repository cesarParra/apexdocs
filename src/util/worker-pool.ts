import { Worker } from 'node:worker_threads';
import os from 'node:os';

export type WorkerPoolOptions = {
  /**
   * Max number of workers to spawn. Defaults to the machine CPU count (at least 1).
   */
  maxWorkers?: number;
  /**
   * How many tasks may be queued before `run()` rejects.
   * Defaults to Infinity.
   */
  maxQueueSize?: number;
  /**
   * If true, `terminate()` will attempt to drain queued tasks before shutting down.
   * Defaults to false (reject queued tasks immediately).
   */
  drainOnTerminate?: boolean;
  /**
   * If true, the pool will `unref()` workers so they don't keep the process alive.
   * Defaults to false.
   */
  unrefWorkers?: boolean;
};

export type WorkerPoolStats = {
  maxWorkers: number;
  activeWorkers: number;
  idleWorkers: number;
  queuedTasks: number;
  inFlightTasks: number;
  createdWorkers: number;
  completedTasks: number;
  failedTasks: number;
};

type CreateWorker = () => Worker;

/**
 * A small, generic worker-thread pool.
 *
 * Design goals:
 * - Simple request/response `postMessage` protocol (one response per task).
 * - Avoid guessing payload shapes: the worker should echo `{ id, ok, result|error }`.
 * - Safe termination semantics.
 *
 * Worker message contract:
 * - Main thread sends: `{ id: number, payload: unknown }`
 * - Worker responds: `{ id: number, ok: true, result: unknown }`
 *                or `{ id: number, ok: false, error: unknown }`
 *
 * Notes:
 * - The pool does NOT enforce structured cloning safety; your payload/result must be cloneable.
 * - If a worker exits with an in-flight task, that task is rejected and the worker is replaced on demand.
 */
export class WorkerPool {
  private readonly createWorker: CreateWorker;
  private readonly maxWorkers: number;
  private readonly maxQueueSize: number;
  private readonly drainOnTerminate: boolean;
  private readonly unrefWorkers: boolean;

  private nextTaskId = 1;
  private terminating = false;

  private readonly idleWorkers: Worker[] = [];
  private readonly busyWorkers = new Set<Worker>();
  private readonly allWorkers = new Set<Worker>();

  private readonly queue: Array<{
    id: number;
    payload: unknown;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = [];

  private readonly inFlightByWorker = new Map<
    Worker,
    {
      id: number;
      resolve: (value: unknown) => void;
      reject: (reason: unknown) => void;
    }
  >();

  private createdWorkers = 0;
  private completedTasks = 0;
  private failedTasks = 0;

  constructor(createWorker: CreateWorker, options: WorkerPoolOptions = {}) {
    this.createWorker = createWorker;

    const cpuCount = Math.max(1, os.cpus()?.length ?? 1);
    this.maxWorkers = Math.max(1, options.maxWorkers ?? cpuCount);
    this.maxQueueSize = options.maxQueueSize ?? Number.POSITIVE_INFINITY;
    this.drainOnTerminate = options.drainOnTerminate ?? false;
    this.unrefWorkers = options.unrefWorkers ?? false;
  }

  /**
   * Enqueue a task and resolve with the worker's response `result`.
   */
  run<TPayload, TResult>(payload: TPayload): Promise<TResult> {
    if (this.terminating) {
      return Promise.reject(new Error('WorkerPool is terminating; cannot accept new tasks.'));
    }

    if (this.queue.length >= this.maxQueueSize) {
      return Promise.reject(new Error(`WorkerPool queue limit exceeded (maxQueueSize=${this.maxQueueSize}).`));
    }

    const id = this.nextTaskId++;

    return new Promise<TResult>((resolve, reject) => {
      this.queue.push({
        id,
        payload,
        resolve: resolve as unknown as (value: unknown) => void,
        reject,
      });
      this.pump();
    });
  }

  /**
   * Returns current pool stats.
   */
  stats(): WorkerPoolStats {
    return {
      maxWorkers: this.maxWorkers,
      activeWorkers: this.allWorkers.size,
      idleWorkers: this.idleWorkers.length,
      queuedTasks: this.queue.length,
      inFlightTasks: this.inFlightByWorker.size,
      createdWorkers: this.createdWorkers,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
    };
  }

  /**
   * Terminates all workers and rejects queued tasks (unless drainOnTerminate=true).
   *
   * - If `drainOnTerminate` is false (default), queued tasks are rejected immediately,
   *   and in-flight tasks are rejected when each worker is terminated.
   * - If `drainOnTerminate` is true, the pool stops accepting new tasks and will attempt
   *   to finish queued + in-flight tasks before terminating workers.
   */
  async terminate(): Promise<void> {
    if (this.terminating) {
      return;
    }
    this.terminating = true;

    if (!this.drainOnTerminate) {
      // Reject queued tasks immediately.
      while (this.queue.length) {
        const task = this.queue.shift()!;
        task.reject(new Error('WorkerPool terminated before task could start.'));
        this.failedTasks++;
      }
    }

    // If draining, wait for completion (queue becomes empty and no tasks in flight).
    if (this.drainOnTerminate) {
      await this.waitForDrain();
    }

    // Terminate all workers (reject any in-flight tasks they still have).
    const terminations = Array.from(this.allWorkers).map(async (worker) => {
      this.rejectInFlight(worker, new Error('WorkerPool terminated with task still in flight.'));
      try {
        await worker.terminate();
      } catch {
        // Ignore termination errors; worker could already be dead.
      }
    });

    await Promise.all(terminations);

    // Clear all state.
    this.idleWorkers.length = 0;
    this.busyWorkers.clear();
    this.allWorkers.clear();
    this.inFlightByWorker.clear();
  }

  /**
   * Wait until all queued tasks have been processed and no tasks are in flight.
   * This does NOT terminate workers.
   */
  async drain(): Promise<void> {
    await this.waitForDrain();
  }

  private pump(): void {
    if (this.terminating && !this.drainOnTerminate) {
      return;
    }

    // Assign tasks to idle workers first.
    while (this.queue.length > 0) {
      const worker = this.getIdleOrCreateWorker();
      if (!worker) {
        // No idle worker and cannot create more.
        return;
      }
      const task = this.queue.shift()!;
      this.assign(worker, task);
    }
  }

  private getIdleOrCreateWorker(): Worker | null {
    // Prefer idle.
    const idleWorker = this.idleWorkers.pop();
    if (idleWorker) return idleWorker;

    // Create new if allowed.
    if (this.allWorkers.size < this.maxWorkers) {
      const spawnedWorker = this.spawnWorker();
      return spawnedWorker;
    }

    return null;
  }

  private spawnWorker(): Worker {
    const worker = this.createWorker();
    this.createdWorkers++;
    this.allWorkers.add(worker);

    if (this.unrefWorkers) {
      worker.unref();
    }

    worker.on('message', (msg: unknown) => this.onWorkerMessage(worker, msg));
    worker.on('error', (err) => this.onWorkerError(worker, err));
    worker.on('exit', (code) => this.onWorkerExit(worker, code));

    // New workers start idle.
    this.idleWorkers.push(worker);

    return worker;
  }

  private assign(
    worker: Worker,
    task: {
      id: number;
      payload: unknown;
      resolve: (value: unknown) => void;
      reject: (reason: unknown) => void;
    },
  ): void {
    // Move to busy.
    this.idleWorkersRemove(worker);
    this.busyWorkers.add(worker);

    this.inFlightByWorker.set(worker, {
      id: task.id,
      resolve: task.resolve,
      reject: task.reject,
    });

    try {
      worker.postMessage({ id: task.id, payload: task.payload });
    } catch (error) {
      // `postMessage` can throw on clone errors etc.
      this.inFlightByWorker.delete(worker);
      this.busyWorkers.delete(worker);
      this.idleWorkers.push(worker);

      task.reject(error);
      this.failedTasks++;

      // Continue pumping remaining tasks.
      this.pump();
    }
  }

  private onWorkerMessage(worker: Worker, msg: unknown): void {
    const inFlight = this.inFlightByWorker.get(worker);
    if (!inFlight) {
      // Unknown / unexpected message; ignore.
      return;
    }

    // Best-effort validation of message shape.
    const message = msg as { id?: unknown; ok?: unknown; result?: unknown; error?: unknown };
    const isSameTaskId = typeof message?.id === 'number' && message.id === inFlight.id;
    const hasOkFlag = typeof message?.ok === 'boolean';

    // If message doesn't match expected task, treat as failure for that task.
    if (!isSameTaskId || !hasOkFlag) {
      this.finishTask(worker);
      inFlight.reject(new Error('WorkerPool received an invalid response message for the in-flight task.'));
      this.failedTasks++;
      this.pump();
      return;
    }

    this.finishTask(worker);

    if (message.ok) {
      this.completedTasks++;
      inFlight.resolve(message.result);
    } else {
      this.failedTasks++;
      // Preserve worker-provided error payload if possible.
      inFlight.reject(message.error ?? new Error('Worker indicated failure without an error payload.'));
    }

    this.pump();
  }

  private onWorkerError(worker: Worker, err: Error): void {
    // Reject in-flight task if any.
    this.rejectInFlight(worker, err);

    // Remove worker from pool; it may be replaced on demand.
    this.removeWorker(worker);
    this.pump();
  }

  private onWorkerExit(worker: Worker, code: number): void {
    // Reject in-flight task if any.
    this.rejectInFlight(worker, new Error(`Worker exited unexpectedly (code=${code}).`));

    this.removeWorker(worker);
    this.pump();
  }

  private finishTask(worker: Worker): void {
    this.inFlightByWorker.delete(worker);
    this.busyWorkers.delete(worker);

    // Only return to idle if we are not terminating (or we are draining).
    if (!this.terminating || this.drainOnTerminate) {
      this.idleWorkers.push(worker);
    }
  }

  private rejectInFlight(worker: Worker, reason: unknown): void {
    const inFlight = this.inFlightByWorker.get(worker);
    if (!inFlight) return;

    this.inFlightByWorker.delete(worker);
    this.busyWorkers.delete(worker);

    inFlight.reject(reason);
    this.failedTasks++;
  }

  private removeWorker(worker: Worker): void {
    this.inFlightByWorker.delete(worker);
    this.busyWorkers.delete(worker);
    this.idleWorkersRemove(worker);
    this.allWorkers.delete(worker);
  }

  private idleWorkersRemove(worker: Worker): void {
    const workerIndex = this.idleWorkers.indexOf(worker);
    if (workerIndex !== -1) {
      this.idleWorkers.splice(workerIndex, 1);
    }
  }

  private async waitForDrain(): Promise<void> {
    // Fast-path.
    if (this.queue.length === 0 && this.inFlightByWorker.size === 0) {
      return;
    }

    await new Promise<void>((resolve) => {
      const tick = () => {
        // Keep work moving while draining.
        this.pump();

        if (this.queue.length === 0 && this.inFlightByWorker.size === 0) {
          resolve();
          return;
        }
        setTimeout(tick, 10);
      };
      tick();
    });
  }
}
