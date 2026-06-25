import { useState, useEffect } from "react";
import { fetchPriorityNotifications } from "../api/notifications";

export function usePriorityNotifications(limit = 10) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchPriorityNotifications({ limit });
        if (!cancelled) {
          setNotifications(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          // API layer already logged this failure
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { notifications, loading, error };
}
