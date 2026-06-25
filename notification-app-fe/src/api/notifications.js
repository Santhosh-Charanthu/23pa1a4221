import axios from "axios";
import Log from "../lib/logger";

const BASE_URL = import.meta.env.VITE_API_URL;
const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
});

/**
 * Fetch paginated notifications.
 * @param {{ page?: number, limit?: number, notification_type?: string }} params
 * @returns {Promise<{ notifications: Array, total: number }>}
 */
export async function fetchNotifications({
  page = 1,
  limit = 10,
  notification_type = "",
} = {}) {
  const params = { page, limit };
  if (notification_type && notification_type !== "All") {
    params.notification_type = notification_type;
  }

  await Log(
    "backend",
    "info",
    "api",
    `API request started: GET /notifications page=${page} limit=${limit} type=${notification_type || "All"}`,
  );

  try {
    const response = await api.get("", { params });
    const data = response.data;

    await Log(
      "backend",
      "info",
      "api",
      `API request successful: fetched ${data.notifications?.length ?? 0} notifications (total=${data.total ?? 0})`,
    );

    return {
      notifications: data.notifications ?? [],
      total: data.total ?? 0,
    };
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    await Log(
      "backend",
      "error",
      "api",
      `API request failed: GET /notifications — ${msg}`,
    );
    throw new Error(msg);
  }
}

/**
 * Fetch top-N priority notifications.
 * Sorts client-side to mirror priorityNotifications.js logic.
 * @param {{ limit?: number }} options
 * @returns {Promise<Array>}
 */
export async function fetchPriorityNotifications({ limit = 10 } = {}) {
  await Log(
    "backend",
    "info",
    "api",
    `API request started: GET /notifications (priority top ${limit})`,
  );

  try {
    // Fetch multiple pages and merge to get a large enough pool to sort from.
    // We fetch pages 1–3 with limit=10 (the API's safe max) so we have up to
    // 30 notifications to rank, then return the top N by priority weight.
    const pages = [1, 2, 3];
    const results = await Promise.all(
      pages.map((page) =>
        api
          .get("", { params: { page, limit: 10 } })
          .then((r) => r.data.notifications ?? [])
          .catch(() => []),
      ),
    );
    const all = results.flat();

    const weight = { Placement: 3, Result: 2, Event: 1 };
    const sorted = [...all].sort((a, b) => {
      const diff = (weight[b.Type] ?? 0) - (weight[a.Type] ?? 0);
      if (diff !== 0) return diff;
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    const top = sorted.slice(0, limit);

    await Log(
      "backend",
      "info",
      "api",
      `Priority notifications loaded: top ${top.length} returned`,
    );

    return top;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    await Log(
      "backend",
      "error",
      "api",
      `API request failed: priority notifications — ${msg}`,
    );
    throw new Error(msg);
  }
}
