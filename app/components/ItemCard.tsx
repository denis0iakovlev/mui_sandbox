import { Paper, Typography } from "@mui/material";
import { Item } from "@prisma/client";
import notFoundedImage from "public/assets/no_image.jpg"
import RibbomImages from "./RibbonImages";
export default function ItemCard({ item }: { item: Item }) {
    let itemImages:string[] = [];
    if(item.images){
        const rawData = item.images.split(';');
        for(const ing of rawData){
            if(ing.length > 1){
                itemImages.push(ing);
            }
        }
    }else{
        itemImages.push(notFoundedImage);
    }
    return (
        <Paper key={item.id} elevation={4} sx={{m:1, p:1, width: 300}}>
            <RibbomImages inx={item.id} images={itemImages} />
            <Typography component="p">
                {item.price}
            </Typography>
            <Typography component="p">
                {item.size}
            </Typography>
        </Paper>
    )
}