import { ActionFunctionArgs, NodeOnDiskFile, json, unstable_createFileUploadHandler, unstable_parseMultipartFormData , redirect} from "@remix-run/node";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";
import path from "path"
import fs from "fs"

export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.id, "Missing id");
    console.log("plain");
    const data = await request.formData();
    const upData = Object.fromEntries(data);
    invariant(typeof upData.name === "string", "Wrong input name" );
    invariant(typeof upData.description === "string", "Wrong input description");
    await db.productModel.update({
        where:{
            id:+params.id
        },
        data:{
            name:upData.name,
            description:upData.description,
            color:upData.color as string,
            price:+upData.price,
            oldPrice:+upData.oldPrice,
            brandId:{
                set:+upData.brandId
            },
            categoryId:{
                set:+upData.categoryId
            },
            surfaceId:{
                set:+upData.surfaceId
            },
            sexId:{
                set:+upData.sexId,
            }
        },
    })
    return json({200:"all ok"});
}