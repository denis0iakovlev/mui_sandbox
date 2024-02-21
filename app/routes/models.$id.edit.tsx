import { Add } from "@mui/icons-material";
import { Box, Button, FormControl, IconButton, Input, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, TextField, styled } from "@mui/material";
import { ActionFunctionArgs, LoaderFunctionArgs, NodeOnDiskFile, json, redirect, unstable_createFileUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, Outlet, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import React, { ChangeEvent, useState } from "react";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";
import fs from "fs"
import path from "path"
import { Brand, ProductCategory, ProductModel } from "@prisma/client";
import PopListComponent from "~/components/PopListComponent";
import { PopEntity, PopListSettings } from "~/components/PopListComponent";

//use for handling input text change event
type ModelChangeType = Omit<ProductModel, "modelImg">;
type TextFieldChangeType = Exclude<keyof ModelChangeType, "categoryId" | "brandId" | "id" | "surfaceId">;
type RelationChangeType = Exclude<keyof ModelChangeType, TextFieldChangeType | "id">;

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "Missing id of product");
    const model = await db.productModel.findUnique({
        where: { id: +params.id }, include: {
            category: true,
            brend: true,
            surface:true,
        }
    });
    invariant(model, "Not found model of product on id " + params.id);
    //Так как модель хранит в себе ссылки на бренд и на категорию , то нужно получить все бренды и все категории что бы отобразить в расскрывающихся списках
    const brands = await db.brand.findMany();
    const categories = await db.productCategory.findMany();
    const surfaces = await db.surface.findMany();
    return json({ model, brands, categories , surfaces});
}
export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.id, "");
    /*Get record from db */
    console.log("multipart");
    const record = await db.productModel.findUnique({ where: { id: +params.id } });
    const name_without_ext = `product_image_${record?.name}_main`;
    const uploadFileHandler = unstable_createFileUploadHandler({
        directory: `public/images`,
        file: ({ filename, name }) => {
            const ext = path.extname(filename);
            return `${name_without_ext}${name}${ext}`;
        },
        maxPartSize: 30_000_000
    });
    tryDeleteOldImage(`public/images/${record?.modelImg}`);
    const formData = await unstable_parseMultipartFormData(request, uploadFileHandler);
    const fileUploaded = formData.get("model_image") as NodeOnDiskFile;
    //upadate record in db
    if (fileUploaded) {
        await db.productModel.update({
            where: {
                id: +params.id,
            },
            data: {
                modelImg: `/images/${fileUploaded.name}`
            }
        });
    }
    return redirect("/admin");
}

export default function ModelEdit() {
    const { model, brands, categories, surfaces } = useLoaderData<typeof loader>();
    const [modelImg, SetModelImage] = useState<string | null>(model.modelImg);//use for select image model
    const [updateData, SetUpdateData] = useState<ModelChangeType & { category: ProductCategory | null }>(model);
    const [category, SetCategory] = useState<string | undefined>(model.category ? model.category.categoryName : undefined);
    const [brend, SetBrand] = useState<string | undefined>(model.brend ? model.brend.brandName : undefined);
    //surface
    const [surface, SetSurface] = useState<string>(model.surface ? model.surface.surfaceName :"");
    const navigate = useNavigate();
    const submit = useSubmit();
    //Бренд
    //Submit form data to end point
    const handlerClickSubmit = () => {
        console.log("submit data");
        submit(updateData, { method: "post", action: `/models/${model.id}/edit/upload`, navigate: false });
    }
    //For handle text field change events
    const changeDataHandler = (prop: TextFieldChangeType, e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value } } = e;
        updateData[prop] = value;
        SetUpdateData(updateData);
    }
    //For handle PopListComponent change Event
    const selectChangeHandler = (prop: RelationChangeType, e: SelectChangeEvent<string>) => {
        const {
            target: { value }
        } = e;

        switch (prop) {
            case "brandId":
                const brandSelected = brands.find((brand) => brand.brandName === value);
                if (brandSelected) {
                    updateData.brandId = brandSelected.id;
                    SetBrand(brandSelected.brandName);
                } else {
                    throw "Wrong name of brand"
                }
                break;
            case "categoryId":
                const categorySelected = categories.find((cat) => cat.categoryName === value);
                if (categorySelected) {
                    updateData.categoryId = categorySelected.id;
                    updateData.category = categorySelected;
                    SetCategory(categorySelected.categoryName);
                } else {
                    throw "Wrong name of category";
                }
                break;
                case "surfaceId":
                    const surf = surfaces.find((s) => s.surfaceName === value);
                    if(surf){
                        updateData.surfaceId = surf.id;
                        SetSurface(surf.surfaceName);
                    }
                    break;

        }
        SetUpdateData(updateData);
    }
    return (
        <Box sx={{ width: 300 }}>
            <Form method="post" encType="multipart/form-data">
                <TextField
                    defaultValue={model.name}
                    name="name"
                    id="id-name"
                    label="Имя модели"
                    variant="outlined"
                    required
                    sx={{
                        m: 1
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeDataHandler("name", e)}
                />
                <TextField
                    defaultValue={model.description}
                    name="description"
                    id="id-description"
                    label="Описание продукта"
                    variant="outlined"
                    required
                    sx={{
                        m: 1
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeDataHandler("description", e)}
                />
                <FormControl fullWidth sx={{ m: 1 }}>
                    <InputLabel id="brand_name">Бренд модели</InputLabel>
                    <Select
                        labelId="brand_name"
                        name="brand"
                        id="id-brand"
                        input={<OutlinedInput label="Бренд модели" />}
                        value={brend}
                        onChange={(e: SelectChangeEvent<string>) => selectChangeHandler("brandId", e)}
                        required
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
                <PopListComponent
                    popEntityList={castCatoriesToPopEntity(categories)}
                    value={category}
                    popListData={{ name: "category", id: "id_category", label_id: "label-category" }}
                    outlineLabel="Категория товара"
                    sx={{ m: 1 }}
                    handlerSelect={(e: SelectChangeEvent<string>) => selectChangeHandler("categoryId", e)}
                />
                <PopListComponent
                    popEntityList={surfaces.map((s)=>({key:s.id, value:s.surfaceName}))}
                    value={surface}
                    popListData={{ name: "surface", id: "id_surface", label_id: "label-surface" }}
                    outlineLabel="Специализация"
                    sx={{ m: 1 }}
                    handlerSelect={(e: SelectChangeEvent<string>) => selectChangeHandler("surfaceId", e)}
                />
                <Box mx={1}>
                    <Button component="label" variant="outlined" sx={{
                        height: 50, width: 50,
                        backgroundSize: "cover",
                        backgroundColor: "transparent",

                    }}>
                        {
                            modelImg ? <img src={modelImg} height={50} /> :
                                <Add />
                        }
                        <VisualllyHiddenInput type="file" accept="image/*" name="model_image" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const elem = e.target;
                            if (elem.files) {
                                SetModelImage(URL.createObjectURL(elem.files[0]))
                            } else {
                                SetModelImage(null);
                            }
                        }} />
                    </Button>
                </Box>
                <Box m={1}>
                    <Button sx={{ marginRight: 1 }} variant="contained" type="submit" name="submiBtn" onClick={handlerClickSubmit}>
                        Сохранить
                    </Button>
                    <Button onClick={() => { navigate("/admin") }} variant="outlined">
                        Отменить
                    </Button>
                </Box>
            </Form>
            <Outlet />
        </Box>
    );
}
const VisualllyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});
function tryDeleteOldImage(oldName: string) {
    if (fs.existsSync(oldName) && fs.lstatSync(oldName).isFile()) {
        fs.rmSync(oldName);
    }
}

function castCatoriesToPopEntity(categories: ProductCategory[]): PopEntity[] {
    const result: PopEntity[] = [];
    for (let cat of categories) {
        const add: PopEntity = { key: cat.id, value: cat.categoryName }
        result.push(add);
    }
    return result;
}