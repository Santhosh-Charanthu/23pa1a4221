import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Button, Box } from "@mui/material";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityNotificationsPage } from "./pages/PriorityNotificationsPage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button color="inherit" component={Link} to="/notifications">
                Notifications
              </Button>
              <Button color="inherit" component={Link} to="/priority">
                Priority
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Routes>
          <Route path="/" element={<Navigate to="/notifications" replace />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/priority" element={<PriorityNotificationsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
