import { Box, Button, TextField, Typography } from "@mui/material"
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant"
import { db } from "~/utils/db.serves";

async function checkSexName(id: number, name: string) {
    console.log(`checked value ${name}`);
    const records = await db.sex.findMany();
    const index = records.findIndex((rec) => {
        if (rec.id !== id) {
            return rec.name === name;
        }
        return false;
    }
    );
    return index !== -1;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "Wrong id edited record of sex table");
    const sex = await db.sex.findUnique({
        where: {
            id: +params.id,
        }
    });
    return json({ sex });
}
export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.id, "Wrong id for update data");
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    if (await checkSexName(+params.id, data.name as string)) {
        return json({ error: "Попытка записать уже сушествующее значение" });
    }
    try {
        await db.sex.update({
            where: {
                id: +params.id
            },
            data: {
                name: data.sex as string,
            }
        });
    } catch (e) {
        if (e instanceof Error) {
            return json({ error: e.message })
        } else {
            return json({ error: "В процесе обновления записи произошла необрабатываемая ошибка" });
        }
    }
    return redirect("/admin");
}

export default function SexPage() {
    const { sex } = useLoaderData<typeof loader>();
    const data = useActionData<typeof action>();
    const navigate = useNavigate();
    return (
        <Box>
            {
                data?.error ? <Typography variant="h6" >
                    {data.error}
                </Typography> : null
            }
            <Form method="post">
                <TextField
                    defaultValue={sex?.name}
                    variant="outlined"
                    label="Пол"
                    name="sex"
                    fullWidth
                >
                </TextField>
                <Button
                    variant="contained"
                    type="submit"
                    sx={{
                        mx: 1,
                    }}
                >
                    Сохранить
                </Button>
                <Button variant="outlined" onClick={() => navigate("/admin")}>
                    Отменить
                </Button>
            </Form>
        </Box>
    )
}