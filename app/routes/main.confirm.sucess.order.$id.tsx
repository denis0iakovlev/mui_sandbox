import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate, useParams } from "@remix-run/react";

export default function SuceesOrderPage() {
    const params = useParams();
    const nav = useNavigate();
    return (
        <Box
            component={Paper}
            elevation={10}
            sx={{
                width: "80%",
                margin: "0 auto",
                height: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent:"space-between",
                p: 5
            }}
        >
            <Typography variant="h6" textAlign="center">
                Номер вашего заказа {params.id}, в самое ближайшее время он будет собран и отправлен по указанному адресу. Спасибо за то что выбрали нас.
            </Typography>
            <Button variant="contained" onClick={() => nav("/main")}
                sx={{
                    width:"max-content",
                    alignSelf:"center"
                }}
            >
                Вернуться в магазин
            </Button>
        </Box>
    )
}