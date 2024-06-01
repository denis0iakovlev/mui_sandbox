import { Box, IconButton, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography } from "@mui/material";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";
import { Unstable_Grid2 as Grid } from "@mui/material"
import { Delete } from "@mui/icons-material";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "Missing id order");
    const order = await db.order.findUnique({
        where: {
            id: +params.id
        },
        include: {
            usr: true,
            items: {
                include: {
                    productModel: true,
                }
            }
        }
    });
    return json({ order });
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);


}

export default function OrderPage() {
    const { order } = useLoaderData<typeof loader>();
    return (
        <Grid container spacing={2}>
            <Grid xs={10} xsOffset={1}
                sm={8} smOffset={2}
                md={6} mdOffset={3}
            >
                <List component={Paper}>
                    {
                        order?.items.map((item) => (
                            <ListItem
                                key={item.id}
                                secondaryAction={
                                    <IconButton>
                                        <Delete />
                                    </IconButton>
                                }
                                sx={{
                                    height:"50px",
                                    maxHeight:"60px",
                                    width:'100%'
                                }}
                            >
                                <ListItemAvatar sx={{
                                    height:"50px"
                                }}>
                                    <img src={item.productModel?.modelImg?.split(';')[0]} className="img-load" alt="image" />
                                </ListItemAvatar>
                                <ListItemText>
                                    {`${item.productModel?.name}`}
                                </ListItemText>
                            </ListItem>
                        )
                        )
                    }
                </List>
            </Grid>
        </Grid>
    )
}