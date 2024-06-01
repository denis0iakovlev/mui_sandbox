import { Badge, Box, IconButton, useTheme } from "@mui/material"
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.serves";
import { getUserId } from "~/utils/session";
import { Order, Item } from "@prisma/client";
import { ShoppingBag } from "@mui/icons-material";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  let currentOrder = null;
  if (typeof userId !== 'string') {
    currentOrder = db.order.create({
      data:{
        status:"OPEN",
        openedData: new Date(),
      }

    });
    return json({currentOrder});
  }
  const user = await db.user.findUnique({
    where: {
      id: +userId,
    },
    include: {
      Order: {
        include: {
          items: true,
        }
      }
    }
  })
  if(user === null){
    currentOrder = db.order.create({
      data:{
        status:"OPEN",
        openedData: new Date(),
      }

    });
    return json({currentOrder});
  }
  //find Open order
  const inxOpenOrder = user.Order.findIndex(o=>o.status === "OPEN");
  if(inxOpenOrder === -1 || user.Order[inxOpenOrder].items.length === 0){
    currentOrder = await db.order.create({
      data:{
        status:"OPEN",
        openedData:new Date(),
        usr:{
          connect:{
            id:user.id
          }
        }
      },
    });
    return json({currentOrder});
  }
  currentOrder= user.Order[inxOpenOrder];
  return json({currentOrder});
}

export default function MainPage() {
  const {currentOrder} = useLoaderData<typeof loader>();
  const theme = useTheme();
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
            <IconButton>
              <Link to={"order/"+currentOrder.id}>
              <ShoppingBag/>
              </Link>
            </IconButton>
        </Badge>
      </Box>
      <Outlet />
    </Box>
  )
}