import { Unstable_Grid2 as Grid } from "@mui/material"
import { Outlet } from "@remix-run/react";

export default function MainPage() {
  return (
    <Grid container spacing={4} sx={{
      backgroundImage: "url(/assets/empty_middle.png)",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundOrigin:"border-box",
      p:2,
      paddingTop:25
    }}
    >
      <Outlet />
    </Grid>
  )
}