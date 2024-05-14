import { AppBar, Box, Button, InputBase, Stack, TextField, Toolbar, Typography, styled } from "@mui/material";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Outlet } from "@remix-run/react";

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '60%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',

        },
    },
}));

export const action = async ({params, request}:ActionFunctionArgs)=>{
    console.log("post");
    return json({});
}
export default function Store() {
    return (
        <Stack direction="column">
            <AppBar position="static" sx={{ width: "60%", margin: "0 auto" }}>
                <Toolbar sx={{ p: 0, minHeight: "50px" }}>
                    <Form id="search-form-id" role="search">
                        <StyledInputBase placeholder="search" inputProps={{ 'aria-label': "Search..." }} />
                        <TextField type="search" name="srch" size="medium" placeholder="Найти..." sx={{ p: "1px 5px" }} />
                        <input type="search" name="q" />
                        <Button type="submit" color="secondary">f</Button>
                    </Form>
                </Toolbar>
            </AppBar>
            <Outlet />
        </Stack>
    )
}