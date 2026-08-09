export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json', ...(init.headers || {}) }
  });
}

export function error(status, message) {
  return json({ error: message }, { status });
}
