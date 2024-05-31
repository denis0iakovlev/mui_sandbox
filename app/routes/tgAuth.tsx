import { Box } from "@mui/material";
import { useEffect } from "react";

export default function tgAuth() {
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
        const tgAuthContainer = document.getElementById("tg-auth-container");
        if(tgAuthContainer != null){
            tgAuthContainer.appendChild(script);
        }else{
            document.body.appendChild(script);
        }
        return () => {

            if(tgAuthContainer != null){
                tgAuthContainer.removeChild(script);
            }else{
                document.body.removeChild(script);
            }
        }
    }, []);
    return (
        <Box id="tg-auth-container" sx={{
            height:"100vh",
            display:"flex",
            justifyContent:"center",
            alignItems:"center"
        }}>

        </Box>
    )
}