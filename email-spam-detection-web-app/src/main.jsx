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
    fontFamily: '"Manrope", "Inter", "Roboto", sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  palette: {
    background: {
      default: "#f7f9fb",
    },
    primary: {
      main: "#000000",
    },
  },
  shape: {
    borderRadius: 8,
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
