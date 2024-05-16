import { Box } from "@mui/material";
import { Outlet } from "@remix-run/react";

export default function MainPage(){
  return(
    <Box sx={{
      backgroundImage:"url(/assets/empty_middle.png)",
      backgroundSize:"cover",
      backgroundRepeat:"no-repeat"
    }}>
      <Outlet/>
    </Box>
  )
}