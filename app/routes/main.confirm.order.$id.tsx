import { Label } from "@mui/icons-material";
import { Box, Button, FormControl, Input, InputLabel, InputProps, Paper, TextField, TextFieldProps, Typography, styled } from "@mui/material";
import { Unstable_Grid2 as Grid } from "@mui/material"
import { shouldForwardProp } from "@mui/styled-engine";
import { Adress } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React, { ChangeEvent, useState } from "react";
import { IMaskInput } from "react-imask";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";
import { getUserId } from "~/utils/session";

type KeyFormData = keyof Omit<Adress, "id"|"userId">;

type Opt<Type> = {
    [Property in keyof Type ]:boolean;
}

function CheckError(formData:FormData)
{

}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    invariant(params.id, "Missing order id");
    const order = await db.order.findUnique({
        where: {
            id: +params.id,
        },
        include: {
            adress: true,
            usr: true,
        }
    });
    invariant(order, "Not found order");
    if (order.usr === null) {
        //try get userId from cookie
        const userId = await getUserId(request);
        if (userId === null || userId === undefined) {
            return redirect("/tgAuth");
        }
        const user = await db.user.findUnique({
            where: {
                id: +userId
            }
        });
        if (user === null) {
            return redirect("/tgAuth");
        }
        invariant(user, "missing user");
        //attach user to order
        await db.order.update({
            where: {
                id: order.id
            },
            data: {
                usrId: user.id,
            }
        });
    }
    return json({ order });
}
export const action = async ({params, request}:ActionFunctionArgs) => {
    let error:string|null = null;
    const formData = await request.formData();
    const entities = Object.fromEntries(formData);
    console.log(entities);
    return json({error});
}

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
    mask:string;
    pattern:string;
}
const TextMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
    function TextMaskCustom(props, ref) {
        const { onChange, ...other } = props;
        return (
            <IMaskInput
                {...other}
                mask={props.mask}
                inputRef={ref}
                onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
                overwrite
                pattern="\d{2}"
            />
        );
    },
);

interface AddresTextFieldProps {
    name:KeyFormData
}

const AddresTextField = React.forwardRef<TextFieldProps, AddresTextFieldProps>(
    function AddresTextField(props, ref){
        const { name, ...other } = props;
        return(
            <TextField
                {...other}
                inputRef={ref}
                name={name}
            />
        )
    }

)



function AdressPart({ adress }: { adress: Adress | null }) {
    const [value, SetValue] = useState({
        textmask_tel: '',
        textmask_index: ''
    });
    
    const handlerChange = (event: ChangeEvent<HTMLInputElement>) => {
        SetValue({
            ...value,
            [event.target.name]: event.target.value
        })
    }
    return (
        <Form method="post">
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "max-content",
                    margin: "15px auto",
                    paddingBlock:2
                }}>
                <Typography>
                    Заполните информацию для доставки
                </Typography>
                <AddresTextField
                    defaultValue={adress?.firstName}
                    name="firstName"
                    label="Имя"
                    variant="outlined"
                    required
                    size="medium"
                />
                <TextField
                    defaultValue={adress?.lastName}
                    name="lastName"
                    label="Фамилия"
                    required
                    variant="outlined"
                />
                <TextMaskCustom onChange={()=>{}} mask="fg" name="hj" pattern="kl"/>
                <AddresTextField
                    variant="outlined"
                    label="Индекс"
                    required
                    name="city"
                    type="tel"
                    placeholder="000-000"
                    InputProps={{
                        inputComponent:TextMaskCustom as any,
                        inputProps:{
                            component:TextMaskCustom as any,
                            mask:/^[1-6]\d{0,5}$/,
                            pettern:"\d{0,5}$"
                        }
                    }}
                    onChange={handlerChange}
                    id="formatted-text-mask-index"
                />

                <Button variant="contained" type="submit">Заказать</Button>
            </Box>
        </Form>
    )
}

export default function ConfirmOrderPage() {
    const { order } = useLoaderData<typeof loader>();
    return (
        <Grid container spacing={2}>
            <Grid xs={10} xsOffset={1}
                sm={8} smOffset={2}
                md={6} mdOffset={3}
            >
                <Paper sx={{
                }}>
                    <AdressPart adress={order.adress} />
                </Paper>
            </Grid>

        </Grid>
    )
}
