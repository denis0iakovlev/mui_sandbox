import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({request}:LoaderFunctionArgs)=>{
  //Get id user if in cookie not corresponding datt then redirect 
  //to tg auth
    return redirect("/main");
}