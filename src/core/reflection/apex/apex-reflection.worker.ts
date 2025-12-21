import { parentPort } from 'node:worker_threads';
import { reflect as mirrorReflection, Type, ParsingError } from '@cparra/apex-reflection';

/**
 * Worker entrypoint for Apex reflection tasks.
 *
 * Protocol:
 * - Main thread sends: { id: number, payload: { content: string } }
 * - Worker responds:  { id: number, ok: true, result: Type }
 *                 or: { id: number, ok: false, error: { message: string } }
 *
 * Note:
 * - The returned `Type` must be structured-cloneable (plain object graph). The `@cparra/apex-reflection`
 *   `Type` mirrors are plain data objects in practice.
 */
type RequestMessage = {
  id: number;
  payload: {
    content: string;
  };
};

type SuccessResponse = {
  id: number;
  ok: true;
  result: Type;
};

type ErrorResponse = {
  id: number;
  ok: false;
  error: {
    message: string;
  };
};

function isRequestMessage(msg: unknown): msg is RequestMessage {
  if (!msg || typeof msg !== 'object') return false;
  const m = msg as { id?: unknown; payload?: unknown };
  if (typeof m.id !== 'number') return false;
  if (!m.payload || typeof m.payload !== 'object') return false;
  const p = m.payload as { content?: unknown };
  return typeof p.content === 'string';
}

function post(msg: SuccessResponse | ErrorResponse): void {
  // `parentPort` should always exist in a worker, but guard anyway.
  if (!parentPort) {
    return;
  }
  parentPort.postMessage(msg);
}

function reflectOrThrow(rawSource: string): Type {
  const result = mirrorReflection(rawSource);

  if (result.typeMirror) {
    return result.typeMirror;
  }

  if (result.error) {
    throw result.error;
  }

  throw new Error('Unknown reflection failure: no typeMirror or error returned.');
}

if (!parentPort) {
  throw new Error('apex-reflection.worker started without a parentPort');
}

parentPort.on('message', (msg: unknown) => {
  if (!isRequestMessage(msg)) {
    // Can't correlate without a valid id; ignore.
    return;
  }

  const { id, payload } = msg;

  try {
    const typeMirror = reflectOrThrow(payload.content);
    post({ id, ok: true, result: typeMirror });
  } catch (e) {
    const message =
      (e as ParsingError | Error | { message?: unknown })?.message &&
      typeof (e as { message: unknown }).message === 'string'
        ? (e as { message: string }).message
        : 'Unknown error';

    post({
      id,
      ok: false,
      error: { message },
    });
  }
});
