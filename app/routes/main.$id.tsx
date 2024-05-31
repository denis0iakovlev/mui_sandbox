
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
import { getUserId } from "~/utils/session";
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
    return json({ productModel });
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
    const form = await request.formData();
    //Получить из луки user id 
    let user: User & { Order: Order[] } | null = null;
    const userId = await getUserId(request);
    let userIsCreated: boolean = false;
    if (userId === null) {
        //create temporary user
        user = await db.user.create({
            data: {
                Order: {
                    create: [
                        {
                            status: "OPEN",
                            openedData: new Date(),
                        }
                    ]
                }
            },
            include: {
                Order: true,
            }
        });
        userIsCreated = true;
    }
    if (typeof userId !== "string") {
        throw "wrong user id";
    }
    user = await db.user.findUnique({
        where: {
            id: +userId
        },
        include: {
            Order: true,
        }
    });
    invariant(user, "User not found");
    //try get on user open order
    let openOrder: Order | null = null;
    if (Object.hasOwn(user, "Order")) {
        const inx = user.Order.findIndex(o => o.status === "OPEN");
        if (inx >= 0) {
            openOrder = user.Order[inx];
        } else {
            openOrder = await db.order.create({
                data: {
                    status: "OPEN",
                    openedData: new Date,
                    usr: {
                        connect: {
                            id: user.id
                        }
                    }
                }
            })
        }
    }else {
        openOrder = await db.order.create({
            data: {
                status: "OPEN",
                openedData: new Date,
                usr: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })
    }
    //
    const entries = Object.fromEntries(form);
    const itemId = form.get("items_id_list") as string;
    const itemIdStr = itemId.split(',');
    const itemIdList:{id:number}[]=[];
    itemIdStr.map((item)=> itemIdList.push({id:+item}));
    return await db.order.update({
        where:{
            id: openOrder.id
        },
        data:{
            items:{
                set:itemIdList
            }
        }
    })
}

export default function MainPage() {
    const { productModel } = useLoaderData<typeof loader>();
    let images = productModel?.modelImg?.split(';').filter((val) => (val != ""));
    if (images === undefined) {
        images = [noImage];
    }
    return (
        <Grid container spacing={1}>
            <Grid xs={12} xl={4} xlOffset={2} sx={{ height: "400" }}>
                {/* Image block */}
                <ImageViewMain images={images} />
            </Grid>
            {/** description block */}
            <Grid xs={12} xl={2} sx={{ height: "400" }}>
                <InfoMain product={productModel} />
            </Grid>
        </Grid>
    )
}