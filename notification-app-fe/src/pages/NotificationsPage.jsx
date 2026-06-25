import { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import Log from "../lib/logger";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { notifications, totalPages, loading, error, unreadCount, viewedIds, markAsViewed } =
    useNotifications({ filter, page });

  // log page load once
  useEffect(() => {
    Log("backend", "info", "page", "Notifications page loaded");
  }, []);

  function handleFilterChange(newFilter) {
    Log("backend", "info", "page", `Filter changed: ${newFilter}`);
    setFilter(newFilter);
    setPage(1); // reset to first page on filter change
  }

  function handlePageChange(_, newPage) {
    // guard invalid page numbers
    if (newPage < 1 || newPage > totalPages) return;
    Log("backend", "info", "page", `Pagination changed: page ${newPage}`);
    setPage(newPage);
  }

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Badge badgeContent={unreadCount} color="primary" max={99}>
          <NotificationsIcon sx={{ fontSize: 28 }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ mb: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">Failed to load notifications: {error}</Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found for the selected filter.</Alert>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Stack sx={{ gap: 1.5 }}>
          {notifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              viewed={viewedIds.has(n.ID)}
              onView={() => markAsViewed(n.ID)}
            />
          ))}
        </Stack>
      )}

      {!loading && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
