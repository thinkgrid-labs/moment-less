import { TOKEN_REGEX, resolveToken } from './tokens.js';
import type { AnyTemporalObject } from './types.js';

function normalizeInstant(obj: AnyTemporalObject): object {
  if (obj instanceof Temporal.Instant) {
    return obj.toZonedDateTimeISO('UTC');
  }
  return obj;
}

export function format(temporalObj: AnyTemporalObject, formatString: string): string {
  const normalized = normalizeInstant(temporalObj);
  // Reset lastIndex since TOKEN_REGEX is a shared stateful regex with /g flag
  TOKEN_REGEX.lastIndex = 0;
  return formatString.replace(TOKEN_REGEX, (token) => resolveToken(token, normalized));
}
