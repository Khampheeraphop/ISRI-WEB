import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#4B3B86",
      dark: "#34285F",
      light: "#7C6BB0",
      contrastText: "#FFFFFF",
    },
    background: { default: "#FAF9FC", paper: "#FFFFFF" },
    text: { primary: "#1F1B2E", secondary: "#635C78" },
    divider: "#E4E1ED",
    error: { main: "#C1443A" },
    warning: { main: "#C68A2E" },
    success: { main: "#3B8F6D" },
    info: { main: "#3E6FA6" },
  },
  typography: {
    fontFamily: '"Anuphan", sans-serif',
    fontSize: 16,
    h1: { fontSize: "2.75rem", fontWeight: 700, lineHeight: 1.25 },
    h2: { fontSize: "2.25rem", fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.35 },
    h4: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.4 },
    h5: { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.45 },
    h6: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.45 },
    body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.65 },
    body2: { fontSize: "0.9rem", fontWeight: 400, lineHeight: 1.6 },
    button: { fontSize: "0.95rem", fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: "none", border: "1px solid #E4E1ED" },
      },
    },
    MuiButton: { styleOverrides: { root: { boxShadow: "none" } } },
    MuiInputBase: { styleOverrides: { root: { fontSize: "1rem" } } },
    MuiFormLabel: { styleOverrides: { root: { fontSize: "0.95rem" } } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: "0.95rem" } } },
  },
});
