import { Box } from "@mui/material"
import { Outlet } from "@remix-run/react";

export default function MainPage() {
  return (
    <Box container spacing={4} sx={{
      backgroundImage: "url(/assets/empty_middle.png)",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundOrigin:"border-box",
      p:2,
    }}
    >
      <Outlet />
    </Box>
  )
}