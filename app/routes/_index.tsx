import { Box, Paper, Typography } from "@mui/material";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import adminImg from "public/assets/admin.png";
import adminImg2 from "public/assets/admin2.webp";
import adminImg3 from "public/assets/admin3.png";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <>
    <Box component={Paper} elevation={4} sx={{
      width: 350, borderRadius: 5,
      "&:hover": {
        backgroundColor: "green",
      }
    }} >
      <Link to={"/admin"} >
        <img src={adminImg3} className="img-index" />
      </Link>
    </Box>
      <Link to={"/store/item"} >
        <Typography component="p" >
          Магазин теннисной одежды и обуви
        </Typography>
      </Link>
      </>
  )
}
