import { createCookieSessionStorage, redirect } from "@remix-run/node";
export const KEY_COOKIE = "orderId";

interface cookieData {
    orderId: string,
}
interface userData{
    userId:string,
}
const { commitSession, getSession, destroySession } = createCookieSessionStorage<cookieData>({
    cookie: {
        name: "order_data",
        path: "/",
        maxAge: 60 * 60 * 24 * 2,
        sameSite: "lax",
        httpOnly: true,
    }
});

export async function getOrderId(reques: Request) {
    const session = await getSession(reques.headers.get("Cookie"));
    if (!session.has(KEY_COOKIE)) {
        return null;
    }
    return session.get(KEY_COOKIE);
}

export async function setOrderIdCookie({ key, redirectTo }: { key: string; redirectTo: string; }) {
    const session = await getSession();
    session.set(KEY_COOKIE, key);
    return redirect(redirectTo, {
        status: 302,
        headers: {
            "Set-Cookie": await commitSession(session),
        }
    })
}
export async function destroyOrderCookie(request:Request, redirectTo:string){
    const session = await getSession(request.headers.get("Cookie"));
    return redirect(redirectTo, {
        status:302,
        headers:{
            "Set-Cookie":await destroySession(session),
        }
    });
}
/* For user id cookie */
const userIdSession = createCookieSessionStorage<userData>({
    cookie: {
        name: "user_id",
        path: "/",
        maxAge: 60 * 60 * 24 ,//one day
        sameSite: "lax",
        httpOnly: true,
    }
});

export async function getUserId(request:Request){
    const session = await userIdSession.getSession(request.headers.get("Cookie"));
    if(!session.has("userId")){
        return null;
    }
    return session.get("userId");
}

export async function login(userId:string, redirectTo:string) {
    const session = await userIdSession.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        status: 302,
        headers: {
            "Set-Cookie": await userIdSession.commitSession(session),
        }
    });
}
