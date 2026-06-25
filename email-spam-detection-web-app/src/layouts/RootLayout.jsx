import { Outlet, useNavigate, useLocation } from "react-router"
import {
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material"

const navLinks = [
  { label: "Dashboard", path: "/" },
  { label: "Analytics", path: "/about" },
  { label: "Detection Log", path: "/spam-check" },
  { label: "Settings", path: "/about" },
]

export default function RootLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f7f9fb" }}>
      <Box
        component="header"
        sx={{
          height: 64,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "#fff",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Veritas AI
          </Typography>

          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            {navLinks.map(({ label, path }) => (
              <Button
                key={path}
                size="small"
                color="inherit"
                onClick={() => navigate(path)}
                sx={{
                  minWidth: 0,
                  px: 0,
                  py: 0.5,
                  borderRadius: 0,
                  fontSize: 13,
                  color: pathname === path ? "text.primary" : "text.secondary",
                  borderBottom: pathname === path ? "2px solid #000" : "2px solid transparent",
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/spam-check")}
            sx={{
              bgcolor: "#000",
              color: "#fff",
              borderRadius: 1,
              fontSize: 11,
              px: 2,
              py: 0.8,
              "&:hover": { bgcolor: "#2d3133" },
            }}
          >
            Analyze Email
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3, flexGrow: 1 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "#fff",
          py: 2.5,
          mt: "auto",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Typography variant="caption" fontWeight={800}>
              Veritas AI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              © 2024 Veritas AI Technologies.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2.5 }}>
            {["Privacy", "Terms", "Support"].map((label) => (
              <Typography
                key={label}
                variant="caption"
                color="text.secondary"
                sx={{ cursor: "default" }}
              >
                {label}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
