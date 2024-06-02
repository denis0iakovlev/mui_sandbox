import { createCookieSessionStorage, redirect } from "@remix-run/node";
export const KEY_COOKIE = "orderId";

interface cookieData {
    orderId: string,
}
const { commitSession, getSession, destroySession } = createCookieSessionStorage<logDat>({
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

export async function setCookie(key: string, redirectTo: string) {
    const session = await getSession();
    session.set(KEY_COOKIE, key);
    return redirect(redirectTo, {
        status: 302,
        headers: {
            "Set-Cookie": await commitSession(session),
        }
    })
}

