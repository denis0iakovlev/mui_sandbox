import { Box, useTheme } from "@mui/material";
import { Unstable_Grid2 as Grid } from "@mui/material"
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import ItemCard from "~/components/ItemCard";
import { db } from "~/utils/db.serves";

export const loader = async ({params}:LoaderFunctionArgs)=>{
    invariant(params.id, "id is wrong");
    const productModel = await db.productModel.findUnique({
        where: {
            id: +params.id
        },
        include:{
            modelItems:true,
            brend:true,
        }
    });
    return json({productModel});
}
export default function MainPage()
{
    const theme = useTheme();
    const {productModel} = useLoaderData<typeof loader>();
    return(
        <Grid xs={6}  sm={4} md={4} lg={4} lgOffset={4}  xl={4} xlOffset={4} sx={{m:"0, auto"}}>
            <ItemCard itemModel={productModel}/>
        </Grid>
    )
}