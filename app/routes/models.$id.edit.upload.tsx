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
    const sexId = +upData.sexId;
    await db.productModel.update({
        where:{
            id:+params.id
        },
        data:{
            name:upData.name,
            description:upData.description,
            brandId:{
                set:+upData.brandId
            },
            categoryId:{
                set:+upData.categoryId
            },
            surfaceId:{
                set:+upData.surfaceId
            }
        },
    })
    return json({200:"all ok"});
}