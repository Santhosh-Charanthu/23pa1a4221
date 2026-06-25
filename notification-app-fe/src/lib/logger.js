/**
 * Frontend logger — mirrors the logging-middleware interface.
 * Sends structured log entries to the evaluation-service /logs endpoint.
 *
 * Circuit breaker: if the log endpoint returns a client error (4xx) it means
 * the token is invalid or the payload is wrong. Stop retrying until the page
 * reloads to avoid flooding the network tab with pointless requests.
 */

const LOG_BASE_URL = import.meta.env.VITE_LOG_BASE_URL;
const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

let disabled = false; // tripped by 4xx from the log endpoint

/**
 * @param {"backend"} stack
 * @param {"info"|"warn"|"error"|"debug"} level
 * @param {string} pkg
 * @param {string} message
 */
async function Log(
  stack = "backend",
  level = "info",
  pkg = "app",
  message = "",
) {
  if (disabled) return;

  try {
    const res = await fetch(LOG_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });

    // 4xx means bad token or bad payload — no point retrying on every call
    if (res.status >= 400 && res.status < 500) {
      disabled = true;
    }
  } catch {
    // network error — fail silently, don't trip the breaker (server may recover)
  }
}

export default Log;
