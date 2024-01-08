import { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";

export const action =  async ({params, request}:ActionFunctionArgs)=>{
    invariant(params.id, "Missing id for update item");
    const formData = await request.formData();
    const upData = Object.fromEntries(formData);
    await db.item.update({
        where:{
            id:+params.id,
        }, 
        data:{
            quantity:+upData.quantity,
            color:upData.color as string,
            price:+upData.price,
            oldPrice:+upData.oldPrice,
            size:upData.size as string,
            modelId:{
                set:+upData.modelId
            },
            sexId:{
                set:+upData.sexId
            }
        }
    });
    return json({202:"ok"})
}