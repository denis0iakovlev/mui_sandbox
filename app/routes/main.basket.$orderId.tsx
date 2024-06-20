import { Box, Button, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";
import { Unstable_Grid2 as Grid } from "@mui/material"
import { Delete } from "@mui/icons-material";
import { Brand, Item, ProductModel } from "@prisma/client";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.orderId, "Missing id order");
    const order = await db.order.findUnique({
        where: {
            id: +params.orderId
        },
        include: {
            usr: true,
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
    });
    return json({ order });
}
export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.id, "Missing id order");
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    console.log(data);
    const typeAction = data["_action"] as string
    if (typeAction === "delete") {
        const itemIdDelete = data["toDeleteItemId"] as string;
        invariant(itemIdDelete, "Missing id item to delete from order");
        const order = await db.order.findUnique({
            where: {
                id: +params.id,
            },
            include: {
                items: true,
            }
        });
        invariant(order, "Order is not found");
        const itemId = +itemIdDelete;
        const inx = order.items.findIndex((it) => (it.id === itemId));
        if (inx === undefined || inx < 0) {
            invariant(null, "Not found id in order");
        }
        order.items.splice(inx, 1);
        await db.order.update({
            where: {
                id: order.id,
            },
            data: {
                items: {
                    set: order.items,
                }
            }
        });
    }
    return json({});
}
export default function OrderPage() {
    const { order } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    return (
        <Grid container spacing={2}>
            <Grid xs={12}
                sm={10} smOffset={1}
                md={6} mdOffset={3}
            >
                <fetcher.Form method="post">
                    <Paper sx={{
                        minHeight: "400px",
                        width:"100%"
                    }}>
                        {
                            order?.items.length > 0 ?
                                <OrderItemsView items={order?.items} />
                                : <Typography
                                    justifySelf="center"
                                    alignSelf="center"
                                    m="0 auto"
                                >
                                    Корзина пуста
                                </Typography>
                        }
                    </Paper>
                </fetcher.Form>
            </Grid>
        </Grid>
    )
}

function OrderItemsView({ items }: {
    items: Array<Item & { productModel: ProductModel & { brend: Brand } }>
}) {
    const nav = useNavigate();
    const param = useParams();
    const handlerDelete = (idItem: string) => {
        const element = document.getElementById("delete-item-id") as HTMLInputElement;
        if (element) {
            element.value = idItem;
        }
    }
    let summary = 0;
    items.forEach((item) => {
        summary += item.productModel?.price ?? 0;
    });
    return (
        <Box
            sx={{
                paddingInline:1,
                display:"flex",
                flexDirection:"column"
            }}
        >
            <List sx={{
                width:"100%",
                justifySelf:"center",
            }
            }>
                {
                    items.map((item) => (
                        <ListItem
                            key={item.id}
                            secondaryAction={
                                <IconButton
                                    name="_action"
                                    value="delete"
                                    onClick={() => (handlerDelete(item.id.toString()))}
                                    type="submit"
                                >
                                    <Delete />
                                </IconButton>
                            }
                            sx={{
                                width: '100%',
                                display: "flex",
                            }}
                        >
                            <ListItemAvatar sx={{
                                height: "50px"
                            }}>
                                <img src={item.productModel?.modelImg?.split(';')[0]} className="img-load" alt="image" />
                            </ListItemAvatar>
                            <ListItemText
                            >
                                <Box sx={{
                                    display: "flex"
                                }}>
                                    <Typography sx={{
                                        justifySelf: "start",
                                        flex:"1"
                                    }}>
                                        {` ${item.productModel?.brend?.brandName} ${item.productModel?.name} US ${item.size}`}
                                    </Typography>
                                    <Typography marginInline={1}>
                                        {item.productModel?.price}
                                    </Typography>
                                </Box>
                            </ListItemText>
                        </ListItem>
                    )
                    )
                }
            </List>
            <Divider />
            <Typography
                variant="body2"
                sx={{
                    alignSelf: "end",
                    marginRight: 4,
                    marginBlock: 2
                }}
            >
                Сумма заказа : {summary} р.
            </Typography>
            <input type="hidden" name="toDeleteItemId" id="delete-item-id" />
            <Divider />
            <Button sx={{
                width: "80%",
                alignSelf: "center",
                marginBlock: 2
            }}
                variant="contained"
                onClick={()=>{nav("/main/confirm/order/"+param.id)}}
            >
                Оформить заказ
            </Button>
        </Box>
    )
}