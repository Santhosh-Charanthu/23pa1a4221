import {
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

const TYPE_COLOR = {
  Placement: "success",
  Result: "warning",
  Event: "info",
};

/**
 * @param {{ notification: object, viewed: boolean, onView: () => void }} props
 */
export function NotificationCard({ notification, viewed, onView }) {
  const { ID, Type, Message, Timestamp } = notification;

  return (
    <Card
      variant="outlined"
      onClick={onView}
      sx={{
        cursor: "pointer",
        borderLeft: viewed ? undefined : "4px solid",
        borderLeftColor: viewed ? undefined : "primary.main",
        opacity: viewed ? 0.75 : 1,
        transition: "opacity 0.2s",
        "&:hover": { boxShadow: 2 },
      }}
      aria-label={`Notification: ${Message}`}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack sx={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
          <Stack sx={{ flexDirection: "row", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Chip
              label={Type}
              color={TYPE_COLOR[Type] ?? "default"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body2" color="text.secondary" fontSize={11}>
              #{ID}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" noWrap>
            {new Date(Timestamp).toLocaleString()}
          </Typography>
        </Stack>

        <Typography variant="body1" mt={0.75}>
          {Message}
        </Typography>
      </CardContent>
    </Card>
  );
}
