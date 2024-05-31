import { type LoaderFunctionArgs } from "@remix-run/node";
import { checkLogin } from "~/utils/session";

export const loader = async ({request}:LoaderFunctionArgs)=>{
  //Get id user if in cookie not corresponding datt then redirect 
  //to tg auth
    return checkLogin(request);
}