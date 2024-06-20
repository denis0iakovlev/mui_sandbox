import { Label } from "@mui/icons-material";
import { Alert, Box, Button, FormControl, Input, InputLabel, InputProps, Paper, TextField, TextFieldProps, Typography, styled, useTheme } from "@mui/material";
import { Unstable_Grid2 as Grid } from "@mui/material"
import { Adress } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { pattern } from "isbot";
import { error } from "node:console";
import React, { ChangeEvent, useState } from "react";
import { IMaskInput } from "react-imask";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";
import { getUserId } from "~/utils/session";

type AdressData = Omit<Adress, "id" | "userId">
type AdressError = Partial<AdressData>
type KeyFormData = keyof AdressError
type Opt = {
    [Property in KeyFormData]: string;
}

function CheckError(formData: Opt): Partial<Opt>{
    let error: Partial<Opt> = {} ;
    if (!formData.city) {
        error = {};
        error.city = "Укажите город доставки";
    }
    if(!formData.firstName){
        error = {};
        error.firstName="Укажите имя получателя"
    }
    if(!formData.lastName){
        error = {};
        error.lastName = "Укажите фамилию получателя"
    }
    if(!formData.street){
        error = {};
        error.lastName = "Укажите адрес доставки"
    }
    if(!formData.zipCode || !formData.zipCode.match(/^[1-6]\d{5}$/)){
        error = {};
        error.zipCode = "Укажите правильный индекс, индекс состоит из 6 цифр первая цифра от 1 до 6"
    }
    if(!formData.phoneNumber || !formData.phoneNumber.match(/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/)){
        error = {};
        error.phoneNumber = "Укажите правильный номер телефона"
    }
    return error;
}

function ExtractAdressData(formData:Opt ){
    
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
export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.id, "Wrong id order");
    const formData = await request.formData();
    const entities = Object.fromEntries(formData) as unknown;
    const data: Opt = entities as Opt;
    console.log(data);
    console.log(data.zipCode);
    const error = CheckError(data);
    if(Object.entries(error).length == 0){
        //create in order new adress
        console.log("create into order new adress");
        const order = await db.order.update({
            where:{
                id: +params.id,
            },
            data:{
                status:"IN_PROCESS",
                adress:{
                    create:{
                        city:data.city,
                        zipCode: +data.zipCode,
                        street:data.street,
                        phoneNumber:data.phoneNumber,
                        firstName:data.firstName,
                        lastName:data.lastName
                    }
                }
            }
        });
        return redirect("/main/confirm/sucess/order/"+order.id);
    }
    return json({ error });
}

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void;
    name: string;
    mask: string;
    pattern: string;
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
                pattern={props.pattern}
            />
        );
    },
);

interface AddresTextFieldProps {
    name: KeyFormData
}

const AddresTextField = React.forwardRef<TextFieldProps, AddresTextFieldProps>(
    function AddresTextField(props, ref) {
        const { name, ...other } = props;
        return (
            <TextField
                {...other}
                inputRef={ref}
                name={name}
            />
        )
    }

)

function AdressPart({ adress , error}: { adress: Adress | null, error: Opt<AdressError> }) {
    const [value, SetValue] = useState({
        phoneNumber: '',
        zipCode: ''
    });
    const theme = useTheme();
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
                    width:"80%",
                    margin: "15px auto",
                    paddingBlock: 2
                }}>
                <Typography p="0 12px">
                    Введите адрес доставки
                </Typography>
                <AddresTextField
                    defaultValue={adress?.firstName}
                    name="firstName"
                    label="Имя"
                    variant="outlined"
                    required
                    size="medium"
                    />
                {
                    error?.firstName ? <Alert severity="error" >
                        {error.firstName}
                    </Alert>
                        : null
                }
                <AddresTextField
                    defaultValue={adress?.lastName}
                    name="lastName"
                    label="Фамилия"
                    required
                    variant="outlined"
                />
                {
                    error?.lastName ? <Alert severity="error" >
                        {error.lastName}
                    </Alert>
                        : null
                }
                <AddresTextField
                    defaultValue={adress?.lastName}
                    name="city"
                    label="Город"
                    required
                    variant="outlined"
                />
                {
                    error?.city ? <Alert severity="error" >
                        {error.city}
                    </Alert>
                        : null
                }
                <AddresTextField
                    defaultValue={adress?.lastName}
                    name="street"
                    label="Улица и номер дома"
                    required
                    placeholder="Ленина 15, дом 12, кв.6"
                    variant="outlined"
                />
                {
                    error?.street ? <Alert severity="error" >
                        {error.street}
                    </Alert>
                        : null
                }
                <AddresTextField
                    variant="outlined"
                    label="Индекс"
                    required
                    name="zipCode"
                    type="tel"
                    value={value.zipCode}
                    placeholder="000000"
                    InputProps={{
                        inputComponent: TextMaskCustom as any,
                        inputProps: {
                            component: TextMaskCustom as any,
                            mask: "000000",
                        }
                    }}
                    onChange={handlerChange}
                    id="formatted-text-mask-index"
                />
                 {
                    error?.zipCode ? <Alert severity="error" >
                        {error.zipCode}
                    </Alert>
                        : null
                }
                <AddresTextField
                    variant="outlined"
                    label="Номер телефона"
                    required
                    name="phoneNumber"
                    value={value.phoneNumber}
                    placeholder="Введите номер телефона"
                    InputProps={{
                        inputComponent: TextMaskCustom as any,
                        inputProps: {
                            component: TextMaskCustom as any,
                            mask: "+{7}(000)000-00-00",
                        }
                    }}
                    onChange={handlerChange}
                    id="formatted-text-mask-telephone"
                />
                {
                    error?.phoneNumber ? <Alert severity="error" >
                        {error.phoneNumber}
                    </Alert>
                        : null
                }
                <Button
                    variant="contained"
                    type="submit"
                    sx={{
                        p:"0 12px"
                    }}
                >Заказать
                </Button>
            </Box>
        </Form>
    )
}

export default function ConfirmOrderPage() {
    const { order } = useLoaderData<typeof loader>();
    const data = useActionData<typeof action>();
    return (
        <Grid container spacing={0}>
            <Grid xs={12}
                sm={8} smOffset={2}
                md={6} mdOffset={3}
            >
                <Paper sx={{
                    p:0
                }}>
                    <AdressPart adress={order.adress} error={data?.error}/>
                </Paper>
            </Grid>

        </Grid>
    )
}
