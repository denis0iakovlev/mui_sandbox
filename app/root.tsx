import { Box, ThemeProvider, createTheme } from "@mui/material";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import { errorMonitor } from "events";
import styles from "~/styles/styles.css"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles }
];
const theme = createTheme({
  palette: {
    primary: {
      main: `hsla(180,90%,45%, 1)`
    }
  },
  typography: {
    fontFamily: "\"Montserrat\", \"Helvetia\" \"Roboto\""
  },
  components: {
    MuiTextField: {
      defaultProps: {
        sx: { m: 1 }
      }
    }
  }
});
export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        {/* add the UI you want your users to see */}
        <Box>
          {
            error instanceof Error ?
            error.message 
            :"Что то пошло не так"
          }
        </Box>
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </ThemeProvider>
      </body>
    </html>
  );
}
