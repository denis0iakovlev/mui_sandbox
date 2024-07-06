import { ExpandMore, Logout } from "@mui/icons-material";
import { Unstable_Grid2 as Grid, Box, Typography, Paper, List, Collapse, ListItem, ListItemAvatar, ListItemText, Button, IconButton, ListItemButton } from "@mui/material"
import { Brand, Item, Order, ProductModel, User } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { db } from "~/utils/db.serves";
import { getUserId, logout } from "~/utils/session"
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserId(request);
    let user = null;
    if (userId) {
        //get from db user data
        console.log("get user id " + userId);
        user = await db.user.findUnique({
            where: {
                id: +userId
            },
            include: {
                Order: {
                    where: {
                        NOT: {
                            status: "OPEN"
                        }
                    },
                    include: {
                        items: {
                            include: {
                                productModel: {
                                    include: {
                                        brend: true,
                                    }
                                }
                            }
                        }
                    }
                },
            },
        })
    }
    console.log(user);
    return json({ user });
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const userId = getUserId(request);
    console.log(`user with id ${userId} is logout`);
    return logout(request, "/main");
}

export default function UserPage() {
    const { user } = useLoaderData<typeof loader>();
    const nav = useNavigate();
    return (
        <Grid container spacing={1}>
            <Grid xs={12} sm={12} md={10} mdOffset={1} lg={6} lgOffset={3}>
                <Paper key={1}
                    sx={{
                        minHeight: 200,
                        p: 2
                    }}
                >
                    {
                        user ? <UserView user={user} />
                            :
                            <Box sx={{
                                height: "100%",
                                minHeight: 200,
                                border: "1px black solid",
                                display: "flex",
                                justifyContent: "center"
                            }}>
                                <Box
                                    sx={{
                                        border: "0.5px grey solid",
                                        height: "max-content",
                                        width: "50%",
                                        alignSelf: "center",
                                        justifySelf: "center",
                                        p: 2
                                    }}
                                >
                                    <Typography variant="body1">
                                        Выполните вход или авторизуйтесь для просмотра личного кабинета
                                    </Typography>
                                    <Box sx={
                                        {
                                            display: "flex",
                                            justifyContent: "space-evenly"
                                        }
                                    }>
                                        <Button variant="outlined" size="small" onClick={() => nav("/tgAuth")}>
                                            Войти
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                    }
                </Paper>
            </Grid>
        </Grid >
    )
}

function UserView({ user }: { user: User & { Order: Array<Order & { items: Array<Item & { productModel: ProductModel & { brend: Brand } }> }> } }) {
    return (
        <Box>
            <Box sx={{
                display: "flex",
                justifyContent: "end"
            }}>
                <Form method="post">
                    <IconButton sx={{
                        display: "block",
                        justifySelf: "end",
                        alignSelf: "end",
                        width: "max-content"
                    }}
                        type="submit"
                    >
                        <Logout />
                    </IconButton>
                </Form>
            </Box>
            <Typography variant="h6" sx={{
                textAlign: "center"
            }}>
                Добро пожаловать {user.userName}
            </Typography>
            <OrderList userOrders={user.Order} />
        </Box>
    )
}

function OrderList({ userOrders }: {
    userOrders: Array<Order & {
        items: Array<Item &
        { productModel: ProductModel & { brend: Brand } }>
    }>
}) {
    const [isOpen, SetOpen] = useState(Array<boolean>(userOrders.length).fill(false))
    const handleExpand = (inx: number) => {
        const mod = isOpen.slice();
        mod[inx] = !mod[inx];
        SetOpen(mod);
    }
    return (
        <>
            <List>
                {
                    userOrders.map((order, inx) => (
                        <>
                            <ListItemButton onClick={() => handleExpand(inx)}>
                                <ListItemText >
                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}>
                                        <Typography variant="caption">
                                            {`Заказ #${order.id} от ${dayjs(order.openedData).format('DD/MM/YYYY')}`}
                                        </Typography>
                                        <Typography variant="caption">
                                            Сумма заказа: {
                                                order.items.reduce((sum, a)=> sum +a.productModel.price, 0)
                                            }
                                        </Typography>
                                    </Box>
                                </ListItemText>
                                <ExpandMore />
                            </ListItemButton>
                            <Collapse in={isOpen[inx]} key={order.id} timeout="auto" unmountOnExit sx={{
                                paddingLeft: 5,
                            }}>
                                <List>
                                    {order.items.map((item) => (
                                        <ListItem key={item.id}>
                                            <ListItemAvatar sx={
                                                {
                                                    width: 30
                                                }
                                            }>
                                                <img src={item.productModel.modelImg?.split(';')[0]} alt="productImage" className="img-load" />
                                            </ListItemAvatar>
                                            <ListItemText
                                            >
                                                <Box sx={{
                                                    display: "flex"
                                                }}>
                                                    <Typography sx={{
                                                        justifySelf: "start",
                                                        flex: "1"
                                                    }}
                                                    variant="caption"
                                                    >
                                                        {` ${item.productModel?.brend?.brandName} ${item.productModel?.name} US ${item.size}`}
                                                    </Typography>
                                                    <Typography marginInline={1} variant="caption">
                                                        {item.productModel?.price}
                                                    </Typography>
                                                </Box>
                                            </ListItemText>
                                        </ListItem>
                                    ))
                                    }
                                </List>
                            </Collapse>
                        </>
                    ))
                }
            </List>
        </>
    )
}