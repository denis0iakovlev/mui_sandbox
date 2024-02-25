import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import ItemCard from "~/components/ItemCard";
import RibbomImages from "~/components/RibbonImages"
import { db } from "~/utils/db.serves"
//Its index so we get all item without any filtering
export const loader = async ()=>{
    const itemList = await db.item.findMany({include:{productModel:true}});
    return json({itemList});
}

export default function Items() {
    const{itemList} = useLoaderData<typeof loader>();
    return(
        <>
            {
                itemList.map((item)=>(<ItemCard item={item}/>))
            }
        </>
    )
}