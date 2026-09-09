import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#4B3B86",
      dark: "#34285F",
      light: "#7C6BB0",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#9C79DF",
      dark: "#6F4CB0",
      light: "#C7B1F3",
      contrastText: "#FFFFFF",
    },
    background: { default: "#F2EEF8", paper: "#FFFFFF" },
    text: { primary: "#231B3A", secondary: "#6A5E8A" },
    divider: "#DFD7ED",
    error: { main: "#C1443A", contrastText: "#FFFFFF" },
    warning: { main: "#C68A2E", contrastText: "#FFFFFF" },
    success: { main: "#3B8F6D", contrastText: "#FFFFFF" },
    info: { main: "#3E6FA6", contrastText: "#FFFFFF" },
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
        root: { 
          boxShadow: "0px 4px 24px rgba(75, 59, 134, 0.08)", 
          border: "1px solid #F0EDF5",
          backgroundColor: "#FFFFFF"
        },
      },
    },
    MuiButton: { 
      styleOverrides: { 
        root: { boxShadow: "none" },
        outlined: { backgroundColor: "#FFFFFF" }
      } 
    },
    MuiChip: {
      styleOverrides: {
        outlined: { backgroundColor: "#FFFFFF" }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: "#FFFFFF" }
      }
    },
    MuiInputBase: { styleOverrides: { root: { fontSize: "1rem" } } },
    MuiFormLabel: { styleOverrides: { root: { fontSize: "0.95rem" } } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: "0.95rem" } } },
  },
});
