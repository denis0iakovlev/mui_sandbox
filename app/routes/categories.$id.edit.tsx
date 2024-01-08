import { Box, Button, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, TextField } from "@mui/material";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "Missing id");
    const category = await db.productCategory.findUnique({
        where: {
            id: +params.id,
        },
        include: {
            brands: true
        }
    });
    const brands = await db.brand.findMany();
    if (!category) {
        throw new Response("Not Found", { status: 404 });
    }
    return json({ category, brands });
}
export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.id, "Missing id");
    const formData = await request.formData();
    const submitData = Object.fromEntries(formData);
    const { categoryName, brands } = submitData;
    invariant(typeof categoryName === "string", "Wrong category name");
    invariant(typeof brands === "string", "Wrong related brands");
    //Записать новое имя категории товаров
    const idCategory: number = +params.id;

    let connectedIds: {id:number}[] = [];
    for (const brandName of brands.split(',')) {
        const connectedBrandObj = await db.brand.findFirst({ where: { brandName } });
        if (connectedBrandObj) {
            connectedIds.push({id:connectedBrandObj.id});
        }
    }
    console.log(connectedIds);
    await db.productCategory.update({
        where: {
            id: idCategory
        },
        data: {
            categoryName: categoryName,
            brands:{
                set:connectedIds
            }
        }
    });
    return redirect("/admin")
}

export default function CategoryEdit() {
    const { category, brands } = useLoaderData<typeof loader>();
    const brandsOfCategory = Array.from(category.brands, (brand) => (brand.brandName));
    const [brandList, setBrandList] = useState<Array<string>>(brandsOfCategory);
    const handler = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value }
        } = event;
        setBrandList(typeof value === "string" ? value.split(',') : value);
    }
    return (
        <Box sx={{ width: 300 }}>
            <Form method="post">
                <TextField
                    variant="outlined"
                    type="text"
                    label="Имя категории"
                    defaultValue={category.categoryName}
                    name="categoryName"
                    sx={{ m: 1 }}
                />
                <FormControl fullWidth sx={{ m: 1 }}>
                    <InputLabel id="brand_name">Представленные бренды</InputLabel>
                    <Select
                        labelId="brand_name"
                        id="brand-multiple-name"
                        name="brands"
                        multiple
                        input={<OutlinedInput label="Представленные бренды" />}
                        value={brandList}
                        onChange={handler}
                    >
                        {
                            brands.map((brand) => (
                                <MenuItem
                                    key={brand.id}
                                    value={brand.brandName}
                                >
                                    {brand.brandName}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                <Button variant="contained" type="submit" sx={{ m: 1 }}>
                    Сохранить
                </Button>
            </Form>
        </Box>
    )
}