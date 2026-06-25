import { useEffect } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

import { NotificationCard } from "../components/NotificationCard";
import { usePriorityNotifications } from "../hooks/usePriorityNotifications";
import Log from "../lib/logger";

export function PriorityNotificationsPage() {
  const { notifications, loading, error } = usePriorityNotifications(10);

  useEffect(() => {
    Log("backend", "info", "page", "Priority Notifications page loaded");
  }, []);

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1.5, mb: 3 }}>
        <StarIcon sx={{ fontSize: 28, color: "warning.main" }} />
        <Typography variant="h5" fontWeight={700}>
          Top Priority Notifications
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">Failed to load priority notifications: {error}</Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No priority notifications available.</Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack sx={{ gap: 1.5 }}>
          {notifications.map((n, idx) => (
            <Box key={n.ID}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ pl: 0.5 }}
              >
                #{idx + 1}
              </Typography>
              <NotificationCard notification={n} viewed={false} onView={() => {}} />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
