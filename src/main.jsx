import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mantine/core/styles.css";
import App from "./App.jsx";

const queryClient = new QueryClient();

const theme = createTheme({
  primaryColor: "yellow",
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: "md",
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>
);
