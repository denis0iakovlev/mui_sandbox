import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { Brand, Item, ProductModel } from "@prisma/client";
import notFoundedImage from "public/assets/no_image.jpg"
import RibbonImages from "./RibbonImages";
import { Link, NavLink, useNavigate } from "@remix-run/react";
import { LinkOff } from "@mui/icons-material";

export default function ItemCard({ itemModel }: { itemModel: ProductModel & { brend?: Brand; modelItems?: Item[] } }) {
    let itemImages: string[] = [];
    const navigate = useNavigate();
    console.log(itemModel);
    if (itemModel.modelImg) {
        const rawData = itemModel.modelImg.split(';');
        for (const ing of rawData) {
            if (ing.length > 1) {
                itemImages.push(ing);
            }
        }
    } else {
        itemImages.push(notFoundedImage);
    }
    return (
        <Paper key={itemModel.id} elevation={7} sx={{
            width: "100%",
        }}>
            <Box sx={
                {
                    width: "100%",
                }
            }>
                <img
                    className="img-card"
                    id={`image-list-id-${0}`}
                    src={itemImages[0]} alt="tennis shoes"
                />
            </Box>
            <Divider sx={{ m: 1 }} />
            <Box >
                <Typography variant="body1">
                    {`${itemModel.brend?.brandName} ${itemModel.name}`}
                </Typography>
                <Typography variant="body2">
                    Цена:
                    <Typography component="span" variant="body2" color="error" sx={{ textDecoration: "line-through" }}>
                        {itemModel.oldPrice}
                    </Typography>
                    {` ${itemModel.price}`}
                </Typography>
            </Box>
        </Paper >
    )
}