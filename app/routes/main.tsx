import { Badge, Box, IconButton, styled, useTheme } from "@mui/material"
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { db } from "~/utils/db.serves";
import { getOrderId } from "~/utils/session";
import { Order, Item } from "@prisma/client";
import { ArrowBack, Person, ShoppingBag } from "@mui/icons-material";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const order = await getOrderId(request);
  let currentOrder = null;
  if (order === null || typeof order === 'undefined') {
    return json({ currentOrder });
  }
  currentOrder = await db.order.findUnique({
    where: {
      id: +order,
      status: "OPEN",
    },
    include: {
      items: true,
    }
  })
  return json({ currentOrder });
}

export default function MainPage() {
  const { currentOrder } = useLoaderData<typeof loader>();
  const nav = useNavigate();
  const handlerBagClick = () => {
    nav("basket");
  }
  return (
    <Box sx={{
      backgroundImage: "url(/assets/empty_middle.png)",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundOrigin: "border-box",
      p: 0,
    }}>
      <Box sx={{
        height: "40px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center",
        alignItems: "center",
        width: "100%"
      }}>
        <Box>
          <IconButton
            onClick={() => nav("/main")}
            sx={{
              display: "block",
            }}
          >
            <ArrowBack sx={{ display: "block" }} />
          </IconButton>
        </Box>
        <Box sx={{
          display: "flex",
          flex: "column",
          width: "100px",
          justifyContent: "space-between",
          justifyItems: "center"
        }}>
          <IconButton sx={{
            display: "block"
          }}>
            <Person />
          </IconButton>
          <MyIcon color="info"
            badgeContent={currentOrder?.items.length}
          >
            <IconButton onClick={handlerBagClick} sx={{
              justifySelf: "end",
              display: "block",
              flexShrink: 1,
            }}>
              <ShoppingBag />
            </IconButton>
          </MyIcon>
        </Box>
      </Box>
      <Outlet />
    </Box>
  )
}
const MyIcon = styled(Badge)(({ theme }) => (
  {
    display: "block",
    '& .MuiBadge': {
      display: "block"
    }
  }));