import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import adminImg3 from "public/assets/admin3.png";

export const meta: MetaFunction = () => {
  return [
    { title: "Goods for tennis" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
      <Box sx={{margin:"auto auto"}}>
        <Button variant="contained" sx={{p:2}}>
          <Typography variant="h6" sx={{p:2}}>
            Для него
          </Typography>
        </Button>
        <Button variant="contained" sx={{p:2}}>
          <Typography variant="h6" sx={{p:2}}>
            Для него
          </Typography>
        </Button>
      </Box>
  )
}
