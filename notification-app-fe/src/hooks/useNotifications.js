import { useState, useEffect, useMemo } from "react";
import { fetchNotifications } from "../api/notifications";

const PAGE_SIZE = 10;

/**
 * @param {{ filter: string, page: number }} params
 */
export function useNotifications({ filter = "All", page = 1 } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [viewedIds, setViewedIds] = useState(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("viewedNotifications") ?? "[]"),
      );
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchNotifications({
          page,
          limit: PAGE_SIZE,
          notification_type: filter === "All" ? "" : filter,
        });

        if (!cancelled) {
          setNotifications(data.notifications);
          setTotal(data.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          // API layer already logged this failure — no duplicate log here
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filter, page]);

  const totalPages = useMemo(
    () => (total > 0 ? Math.ceil(total / PAGE_SIZE) : 1),
    [total],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !viewedIds.has(n.ID)).length,
    [notifications, viewedIds],
  );

  function markAsViewed(id) {
    setViewedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("viewedNotifications", JSON.stringify([...next]));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }

  return {
    notifications,
    total,
    totalPages,
    loading,
    error,
    unreadCount,
    viewedIds,
    markAsViewed,
  };
}
