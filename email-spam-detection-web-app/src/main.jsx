import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router"
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material"
import RootLayout from "./layouts/RootLayout"
import HomePage from "./pages/HomePage"
import AboutPage from "./pages/AboutPage"
import SpamCheckPage from "./pages/SpamCheckPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "spam-check", element: <SpamCheckPage /> },
    ],
  },
])

const theme = createTheme({
  typography: {
    fontFamily: '"Manrope", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontFamily: '"Manrope", sans-serif',
    },
    h2: {
      fontWeight: 700,
      fontFamily: '"Manrope", sans-serif',
    },
    h3: {
      fontWeight: 700,
      fontFamily: '"Manrope", sans-serif',
    },
    h4: {
      fontWeight: 600,
      fontFamily: '"Manrope", sans-serif',
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontFamily: '"Manrope", sans-serif',
    },
  },
  palette: {
    primary: {
      main: "#0F172A",
    },
    background: {
      default: "#f7f9fb",
    },
  },
})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
)
