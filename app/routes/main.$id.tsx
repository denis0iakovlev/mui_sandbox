
import { Box, IconButton, Paper, } from "@mui/material";
import { Unstable_Grid2 as Grid } from "@mui/material"
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React, { useState } from "react";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";
import noImage from "public/assets/no_image.jpg";
import ImageViewMain from "~/components/ImageViewMain";
import InfoMain from "~/components/InfoMain";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "id is wrong");
    const productModel = await db.productModel.findUnique({
        where: {
            id: +params.id
        },
        include: {
            modelItems: true,
            brend: true,
            surface:true,
        }
    });
    return json({ productModel });
}

export default function MainPage() {
    const { productModel } = useLoaderData<typeof loader>();
    let images = productModel?.modelImg?.split(';').filter((val) => (val != ""));
    if (images === undefined) {
        images = [noImage];
    }
    return (
        <Grid container spacing={1}>
            <Grid xs={12} xl={4} xlOffset={2} sx={{height:"400"}}>
                {/* Image block */}
                <ImageViewMain images={images} />
            </Grid>
            {/** description block */}
            <Grid xs={12} xl={2} sx={{height:"400"}}>
                <InfoMain product={productModel}/>
            </Grid>
        </Grid>
    )
}