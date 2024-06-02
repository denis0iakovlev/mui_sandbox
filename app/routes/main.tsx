import { Badge, Box, IconButton, useTheme } from "@mui/material"
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { db } from "~/utils/db.serves";
import { getOrderId } from "~/utils/session";
import { Order, Item } from "@prisma/client";
import { ShoppingBag } from "@mui/icons-material";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const order = await getOrderId(request);
  let currentOrder = null;
  if (order === null){
    return json({currentOrder});
  }
  currentOrder = await db.order.findUnique({
    where:{
      id:+order,
    }, include:{
      items:true,
    }
  })
  return json({currentOrder});
}

export default function MainPage() {
  const {currentOrder} = useLoaderData<typeof loader>();
  const theme = useTheme();
  const nav = useNavigate();
  const handlerBagClick = ()=>{
      if(currentOrder !== null){
        nav("order/"+currentOrder.id)
      }
  }
  return (
    <Box container spacing={4} sx={{
      backgroundImage: "url(/assets/empty_middle.png)",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundOrigin: "border-box",
      p: 2,
    }}
    >
      <Box sx={{
        height:"50px",
      }}>
        <Badge color="info" sx={{
          position:"absolute",
          right:"20px"
        }}
        badgeContent={currentOrder?.items.length }
        >
            <IconButton onClick={handlerBagClick}>
              <ShoppingBag/>
            </IconButton>
        </Badge>
      </Box>
      <Outlet />
    </Box>
  )
}