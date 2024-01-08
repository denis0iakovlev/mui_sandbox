
import { Autocomplete, Box, Button, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, TextField } from "@mui/material";
import { Brand, ProductCategory } from "@prisma/client";
import { json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import invariant from "tiny-invariant";
import { inherits } from "util";
import { db } from "~/utils/db.serves";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "Missing brandId param");

    const idBrand: number = +params.id;
    const brand = await db.brand.findUnique({
        where: {
            id: idBrand
        }, 
        include:{
            categories:true
        }
    });
    const categories = await db.productCategory.findMany({
        select: {
            id: true,
            categoryName: true,
        }
    })
    if (!brand) {
        throw new Response("Not Found", { status: 404 });
    }
    return json({ brand, categories });
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
    
    invariant(params.id, "Missing brandId param");
    const formData = await request.formData();
    const updateData = Object.fromEntries(formData);
    console.log(updateData.brandName);
    console.log(updateData.categories);
    const categories = (updateData.categories as string).split(',');
    let idCategories:Array<{id:number}> = [];
    for(const cat of categories){
        const dbObj = await db.productCategory.findFirst({
            where:{
                categoryName:cat,
            }
        });
        if(dbObj){
            idCategories.push({id:dbObj.id});
        }
    }
    const idBrand: number = +params.id;
    await db.brand.update({
        where:{
            id:idBrand
        },
        data:{
            brandName:updateData.brandName as string,
            categories:{
                set:[]
            }
        }
    });
    await db.brand.update({
        where:{
            id:idBrand
        },
        data:{
            categories:{
                connect:idCategories
            }
        }
    });

    return redirect('/admin');
}

export default function EditPanel() {
    const { brand, categories } = useLoaderData<typeof loader>();
    const initCat = Array.from(brand.categories, (cat)=>(cat.categoryName));
    const [brandCategories, setCategories] = useState<string[]>(initCat);
    const handler = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value }
        } = event;
        console.log(value);
        console.log(event.target.name);
        setCategories(typeof value === "string" ? value.split(",") : value);
    }
    return (
        <Box sx={{ m: 1, width: 300 }}>
            <Form method="post">
                <Box >
                    <TextField
                        variant="outlined"
                        type="text"
                        label="Имя бренда"
                        name="brandName"
                        defaultValue={brand.brandName}
                        fullWidth
                    />
                    <FormControl sx={{ my: 1 }} fullWidth>
                        <InputLabel id="category-name">Категория</InputLabel>
                        <Select
                            labelId="category-name"
                            id="demo-multiple-name"
                            name="categories"
                            multiple
                            input={<OutlinedInput label="Категория" />}
                            value={brandCategories}
                            onChange={handler}
                        >
                            {
                                categories.map((cat) => (
                                    <MenuItem
                                        key={cat.id}
                                        value={cat.categoryName}
                                    >
                                        {cat.categoryName}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Box>
                <Box marginY={1}>
                    <Button
                        variant="contained"
                        type="submit"
                    >
                        Сохранить
                    </Button>
                </Box>
            </Form>
        </Box>
    )

}