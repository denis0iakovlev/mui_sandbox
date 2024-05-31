import { createCookieSessionStorage, redirect } from "@remix-run/node";
interface logDat {
    id: string,
    itemId: number[],
}
const { commitSession, getSession, destroySession } = createCookieSessionStorage<logDat>({
    cookie: {
        name: "user_data",
        path: "/",
        maxAge: 60 * 60 * 24 * 2,
        sameSite: "lax",
        httpOnly: true,
    }
});

export async function getUserId(reques: Request) {
    const session = await getSession(reques.headers.get("Cookie"));
    if (!session.has("id")) {
        return null;
    }
    return session.get("id");
}

export async function login(userId: string, redirectTo: string) {
    const session = await getSession();
    session.set("id", userId);
    return redirect(redirectTo, {
        status: 302,
        headers: {
            "Set-Cookie": await commitSession(session),
        }
    })
}

export async function checkLogin(request: Request) {
    const userId = await getUserId(request);
    if (userId === null) {
        return redirect("/tgAuth");
    } else {
        return redirect("/main");
    }
}

