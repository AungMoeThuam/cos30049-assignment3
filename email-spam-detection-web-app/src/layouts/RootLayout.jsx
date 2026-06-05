import { Outlet, useNavigate, useLocation } from "react-router"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material"

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Spam Check", path: "/spam-check" },
]

export default function RootLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Spam Detector
          </Typography>
          {navLinks.map(({ label, path }) => (
            <Button
              key={path}
              color="inherit"
              variant={pathname === path ? "outlined" : "text"}
              onClick={() => navigate(path)}
            >
              {label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
