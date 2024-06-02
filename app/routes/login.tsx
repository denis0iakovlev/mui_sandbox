import { User } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUser } from "~/utils/db.user";

interface TgUserData {
    id: number,
    first_name: string,
    username: string,
    auth_date: number,
    hash: string
}

function GetTgDataFromReq(request: Request) {
    const url = new URL(request.url);
    type TgUserDataL = keyof TgUserData;
    let tgData: TgUserData = { auth_date: 0, first_name: "", hash: "", id: 0, username: "" };
    url.searchParams.forEach((val, key, parent) => {
        //try to literal
        const keyL = key as TgUserDataL;
        switch (keyL) {
            case "id":
            case "auth_date":
                tgData[keyL] = +val;
                break;
            case "first_name":
            case "username":
            case "hash":
                console.log(`type string ${keyL} = ${val}`)
                tgData[keyL] = val;
                break;
            default:
                break;
        }
    });
    return tgData;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {

    const tgData = GetTgDataFromReq(request);
    //Set cookie
    return login(tgData.id.toString(), "/main");
}