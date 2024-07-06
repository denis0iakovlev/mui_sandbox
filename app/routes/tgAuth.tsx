import { CheckBox } from "@mui/icons-material";
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Paper, useMediaQuery, useTheme } from "@mui/material";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { db } from "~/utils/db.serves";
import { login } from "~/utils/session";
type redirectOption = "order" | "user";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    console.log(request.url);
    return json({});
}
export const action = async ()=>{
    console.log("as guest action");
    const guestName = "guest_" + Math.round( Math.random() *1000); 
    const newUser = await db.user.create({
        data:{
            firstName:guestName,
            isAdmin:false,
            userName:guestName,
        }
    });
    
    return login(newUser.id.toString(), "/main");
}

export default function tgAuth() {
    const data = useLoaderData<typeof loader>();
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.async = true;
        script.setAttribute("data-telegram-login", "denis_test_tg_widget_ts_bot");
        script.setAttribute("data-size", "medium");
        script.setAttribute("data-auth-url", "/login");
        script.setAttribute("data-request-access", "write");
        /**
         * <script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="samplebot" data-size="large" data-auth-url="/main" data-request-access="write"></script>
         */
        const tgAuthContainer = document.getElementById("tg-auth-container") as HTMLDivElement;
        const asGuestForm = document.getElementById("as-guest-form-id");
        if (tgAuthContainer != null) {
            tgAuthContainer.insertBefore(script, asGuestForm);
        } else {
            document.body.appendChild(script);
        }
        return () => {
            if (tgAuthContainer != null) {
                tgAuthContainer.removeChild(script);
            } else {
                document.body.removeChild(script);
            }
        }
    }, []);
    const theme = useTheme();
    const isColumn = useMediaQuery(theme.breakpoints.down('md'));
    const [withoutReg, SetWithoutReg] = useState(false);
    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            flexDirection: isColumn ? "column" : "row",
            height: "100vh"
        }}
        >
            <Box component={Paper} id="tg-auth-container" sx={{
                margin: 5,
                p: 2,
                height: 150,
                width: 230,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column"
            }}
                elevation={2}
            >
                <Box id="as-guest-form-id" sx={{ paddingBlock: 2 }}>
                    <Form method="post">
                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={withoutReg} onClick={() => SetWithoutReg(prev => !prev)} />} label="Продолжить как гость" />
                        </FormGroup>
                        <Button variant="contained" type="submit" disabled={!withoutReg} id="as-guest-id">
                            Продолжить
                        </Button>
                    </Form>
                </Box>
            </Box>
        </Box>
    )
}