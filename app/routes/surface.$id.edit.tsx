import { Box, Button, TextField, Typography } from "@mui/material";
import { Surface } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getRecord } from "~/utils/db.adminPage.utils";
import { db } from "~/utils/db.serves";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "Missing id of surfaces");
    const surface = await getRecord("surface", +params.id);
    const surf = surface as Surface;
    return json({ surf });
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.id, "Missing id of surface");
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    if (!("surfaceName" in data) || typeof data.surfaceName !== "string") {
        return json({ error: "Не удалось получить свойство"})
    }
    await db.surface.update({
        where: {
            id: +params.id
        },
        data: {
            surfaceName: data.surfaceName
        }
    });
    return redirect("/admin");
}

export default function SurfaceEdit() {
    const { surf } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    return (
        <Box>
            <Typography variant="h6" color="secondary">
                БД Покрытия
            </Typography>
            <Form method="post">
                <TextField
                    defaultValue={surf.surfaceName}
                    name="surfaceName"
                    required
                    label="Тип покрытия"
                />
                <Box sx={{m:2}}>
                    <Button type="submit" color="secondary" variant="contained" sx={{mx:2}}> Сохранить</Button>
                    <Button type="submit" color="secondary" variant="outlined" 
                        onClick={()=> navigate("/admin")}
                    > Отменить</Button>
                </Box>
            </Form>
        </Box>
    )
}