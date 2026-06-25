import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const FILTERS = ["All", "Placement", "Result", "Event"];

/**
 * @param {{ value: string, onChange: (v: string) => void }} props
 */
export function NotificationFilter({ value, onChange }) {
  function handleChange(_, newValue) {
    // MUI returns null when the active button is clicked again — keep current value
    if (newValue !== null) {
      onChange(newValue);
    }
  }

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      size="small"
      aria-label="notification type filter"
      sx={{ flexWrap: "wrap", gap: 0.5 }}
    >
      {FILTERS.map((type) => (
        <ToggleButton key={type} value={type} sx={{ textTransform: "none", px: 2 }}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
