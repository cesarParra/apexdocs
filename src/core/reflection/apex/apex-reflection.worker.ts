import { parentPort } from 'node:worker_threads';
import { reflect as mirrorReflection, Type, ParsingError } from '@cparra/apex-reflection';

/**
 * Worker entrypoint for Apex reflection tasks.
 * Protocol:
 * - Main thread sends: { id: number, payload: { content: string } }
 * - Worker responds:  { id: number, ok: true, result: Type }
 *                 or: { id: number, ok: false, error: { message: string } }
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

function isRequestMessage(message: unknown): message is RequestMessage {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const candidateMessage = message as { id?: unknown; payload?: unknown };

  if (typeof candidateMessage.id !== 'number') {
    return false;
  }

  if (!candidateMessage.payload || typeof candidateMessage.payload !== 'object') {
    return false;
  }

  const candidatePayload = candidateMessage.payload as { content?: unknown };
  return typeof candidatePayload.content === 'string';
}

function post(responseMessage: SuccessResponse | ErrorResponse): void {
  // `parentPort` should always exist in a worker, but guard anyway.
  if (!parentPort) {
    return;
  }

  parentPort.postMessage(responseMessage);
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

parentPort.on('message', (message: unknown) => {
  if (!isRequestMessage(message)) {
    // Can't correlate without a valid id; ignore.
    return;
  }

  const { id, payload } = message;

  try {
    const typeMirror = reflectOrThrow(payload.content);
    post({ id, ok: true, result: typeMirror });
  } catch (caughtError) {
    const candidateMessage = (caughtError as ParsingError | Error | { message?: unknown })?.message;

    const errorMessage = typeof candidateMessage === 'string' ? candidateMessage : 'Unknown error';

    post({
      id,
      ok: false,
      error: { message: errorMessage },
    });
  }
});
