import { User } from "@prisma/client";
import { db } from "./db.serves";


export async function getUser(data:User){
    let user = await db.user.findUnique({
        where:{
            id:data.id
        }
    });
    if(user === null){
        user = await db.user.create({data});
    }
    return user;
}