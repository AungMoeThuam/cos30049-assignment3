import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Typography,
  Button,
  Container,
  Box,
  Link,
  AppBar,
  Toolbar,
} from "@mui/material";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/#about" },
  { label: "Email Checker", path: "/spam-check" },
];

export default function RootLayout() {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Navigation Header */}
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 2, md: 8 },
        }}
      >
        <Toolbar
          disableGutters
          sx={{ justifyContent: "space-between", height: 64 }}
        >
          {/* Logo / Brand Name */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Typography
              variant="h6"
              onClick={() => navigate("/")}
              sx={{
                fontWeight: 800,
                cursor: "pointer",
                color: "text.primary",
                fontFamily: '"Manrope", sans-serif',
              }}
            >
              Spam Detector
            </Typography>
          </Box>
          {/* Nav links (hidden on mobile for simplicity, but let's keep them visible) */}
          <Box sx={{ display: "flex", gap: 3, ml: 4 }}>
            {navLinks.map(({ label, path }) => {
              const currentPath = `${pathname}${hash}`;
              const isActive = path.includes("#")
                ? currentPath === path
                : pathname === path;
              return (
                <Button
                  key={path}
                  onClick={() => navigate(path)}
                  sx={{
                    color: isActive ? "text.primary" : "text.secondary",
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: "14px",
                    position: "relative",
                    borderRadius: 0,
                    px: 1,
                    minWidth: "auto",
                    borderBottom: isActive ? "2px solid" : "none",
                    borderColor: "text.primary",
                    "&:hover": {
                      bgcolor: "transparent",
                      color: "text.primary",
                    },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Container maxWidth="xl" sx={{ mt: 6, mb: 8, flexGrow: 1 }}>
        <Outlet />
      </Container>

      {/* Modern Minimalist Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          py: 4,
          px: { xs: 3, md: 8 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "xl",
            mx: "auto",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                fontFamily: '"Manrope", sans-serif',
                mr: 2,
              }}
            >
              Spam Detector
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: '"Manrope", sans-serif' }}
            >
              © 2026 Spam Detector. Swinburne University Research Project.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {[
              "Privacy Policy",
              "Terms of Service",
              "Documentation",
              "Support",
            ].map((item) => (
              <Link
                key={item}
                href="#"
                underline="hover"
                color="text.secondary"
                sx={{
                  fontFamily: '"Manrope", sans-serif',
                  fontSize: "12px",
                  "&:hover": { color: "text.primary" },
                }}
              >
                {item}
              </Link>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
