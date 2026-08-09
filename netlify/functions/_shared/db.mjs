import { getDatabase } from '@netlify/database';

let cached;

export function db() {
  if (!cached) {
    cached = getDatabase();
  }
  return cached;
}
