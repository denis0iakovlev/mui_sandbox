
import { Box, IconButton, Paper, } from "@mui/material";
import { Unstable_Grid2 as Grid } from "@mui/material"
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React, { useState } from "react";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";
import noImage from "public/assets/no_image.jpg";
import ImageViewMain from "~/components/ImageViewMain";
import InfoMain from "~/components/InfoMain";
import { request } from "http";
import { getOrderId, setCookie } from "~/utils/session";
import { User, Order } from "@prisma/client";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "id is wrong");
    const productModel = await db.productModel.findUnique({
        where: {
            id: +params.id
        },
        include: {
            modelItems: true,
            brend: true,
            surface: true,
        }
    });
    //
    return json({ productModel });
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
    //Получить из луки user id
    const orderId = await getOrderId(request);

    let orderIsCreated = false;
    let order = null;
    if (orderId === null) {
        orderIsCreated = true;
        order = await db.order.create({
            data: {
                status: "OPEN",
                openedData: new Date(),
            }, include:{
                items:true,
            }
        });
        invariant(order, "New order wasnt created" + orderId)
    } else {
        order = await db.order.findUnique({
            where: {
                id: +orderId
            }, include:{
                items:true,
            }
        });
        invariant(order, "Not fount order with id " + orderId)
    }
    const form = await request.formData();
    //
    const inputVal =  form.get("items_id_list") as string;
    if (typeof inputVal === "string"){

        const itemList = inputVal.split(',');
        let itemIdList:number[] = Array.from(itemList, (item) => (+item));
        let oldItemListId = Array.from(order.items, (item) => (item.id));
        const fullNewList = oldItemListId.concat(itemIdList);
        let connectItems :{id:number}[] =  fullNewList.map((id)=> ({id:id}));
        
        order = await db.order.update({
            where:{
                id:order.id,
            }, data:{
                items:{
                    set:connectItems
                }
            }
        })
    }
    if(orderIsCreated){
        return await setCookie(order.id.toString(),"/main/"+params.id );
    }
    return json({order});
}

export default function MainPage() {
    const { productModel } = useLoaderData<typeof loader>();
    let images = productModel?.modelImg?.split(';').filter((val) => (val != ""));
    if (images === undefined) {
        images = [noImage];
    }
    return (
        <Grid container spacing={4}>
            <Grid xs={12} sm={10} smOffset={1} xl={4} xlOffset={2} sx={{ height: "400px" }}>
                {/* Image block */}
                <ImageViewMain images={images} />
            </Grid>
            {/** description block */}
            <Grid xs={12} sm={10} smOffset={1}
                xl={2} sx={{ height: "400px" }}>
                <InfoMain product={productModel} />
            </Grid>
        </Grid>
    )
}