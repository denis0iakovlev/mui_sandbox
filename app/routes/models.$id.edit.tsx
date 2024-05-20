import { Add } from "@mui/icons-material";
import { Box, Button, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, Stack, TextField, Typography, styled } from "@mui/material";
import { ActionFunctionArgs, LoaderFunctionArgs, NodeOnDiskFile, json, redirect, unstable_createFileUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import React, { ChangeEvent, useState } from "react";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";
import fs from "fs"
import path from "path"
import { Brand, ProductCategory, ProductModel, Sex } from "@prisma/client";
import PopListComponent from "~/components/PopListComponent";
import { PopEntity, PopListSettings } from "~/components/PopListComponent";
import { ImageList } from "~/components/ImageList";

//use for handling input text change event
type ModelChangeType = Omit<ProductModel, "modelImg">;
type TextFieldChangeType = Exclude<keyof ModelChangeType, "categoryId" | "brandId" | "id" | "surfaceId" | "sexId">;
type RelationChangeType = Exclude<keyof ModelChangeType, TextFieldChangeType | "id">;

const PATH_TO_IMG: string = "images/modelItem";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "Missing id of product");
    const model = await db.productModel.findUnique({
        where: { id: +params.id }, include: {
            category: true,
            brend: true,
            surface: true,
            sex: true,
            modelItems: true,
        }
    });
    invariant(model, "Not found model of product on id " + params.id);
    //Так как модель хранит в себе ссылки на бренд и на категорию , то нужно получить все бренды и все категории что бы отобразить в расскрывающихся списках
    const brands = await db.brand.findMany();
    const categories = await db.productCategory.findMany();
    const surfaces = await db.surface.findMany();
    const sexList = await db.sex.findMany();
    return json({ model, brands, categories, surfaces, sexList });
}
export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.id, "");
    /*Get record from db */
    const record = await db.productModel.findUnique({ where: { id: +params.id } });
    //Получить имеюшиеся файлы 
    invariant(record, "Not found item on item id " + params.id);
    const imageList = Array<string>(5).fill("");
    if (record.modelImg) {
        //Get list all images from db
        const dbImages = record.modelImg.split(';');
        for (let image of dbImages) {
            const baseName = path.basename(image, path.extname(image));
            const reg = /_([0-9]+)(-[0-9]+)*/;
            const match = baseName.match(reg);
            const fullName = `${process.cwd()}/public/${image}`;
            const stat = fs.existsSync(fullName);
            if (match && stat) {
                const index_to_replace = +match[1];
                imageList.splice(index_to_replace, 1, image);
            }
        }
    }
    const uploadFileHandler = unstable_createFileUploadHandler({
        directory: `public/${PATH_TO_IMG}/${record.id}`,
        file: ({ filename, name }) => {
            const ext = path.extname(filename);
            return `${name}${ext}`;
        },
        maxPartSize: 30_000_000
    });
    const formData = await unstable_parseMultipartFormData(request, uploadFileHandler);
    for (let i = 0; i < 5; i++) {
        const name = `img_file_${i}`;
        const file = formData.get(name);
        if (file) {
            const fileNode = file as NodeOnDiskFile;
            //Get old name of file 
            const oldFileName = `${process.cwd()}/public/${imageList[i]}`;
            const stat = fs.existsSync(oldFileName);
            if (imageList[i] && stat) {
                //echange extensions
                const extNew = path.extname(fileNode.name);
                fs.rmSync(oldFileName);
                const pathToFile = path.dirname(oldFileName);
                const newName = path.normalize(`${pathToFile}/${name}${extNew}`);
                if (newName !== fileNode.getFilePath()) {
                    fs.renameSync(fileNode.getFilePath(), newName);
                }
                //
                imageList.splice(i, 1, `/${PATH_TO_IMG}/${record.id}/${name}${extNew}`);
            } else {
                imageList.splice(i, 1, `/${PATH_TO_IMG}/${record.id}/${fileNode.name}`);
            }
        }
    }
    //upadate record in db
    if (imageList) {
        await db.productModel.update({
            where: {
                id: +params.id,
            },
            data: {
                modelImg: imageList.join(';')
            }
        });
    }
    return json({});
}

export default function ModelEdit() {
    const { model, brands, categories, surfaces, sexList } = useLoaderData<typeof loader>();
    const [updateData, SetUpdateData] = useState<ModelChangeType & { category: ProductCategory | null }>(model);
    const [category, SetCategory] = useState<string | undefined>(model.category ? model.category.categoryName : undefined);
    const [brend, SetBrand] = useState<string | undefined>(model.brend ? model.brend.brandName : undefined);
    //surface
    const [surface, SetSurface] = useState<string>(model.surface ? model.surface.surfaceName : "");
    //state for select sex 
    const [sex, SetSex] = useState<Sex | null>(model.sex);
    //other hooks
    const navigate = useNavigate();
    const submit = useSubmit();
    //Get images of model
    const imageList = model.modelImg ? model.modelImg.split(';') : [];
    console.log(imageList);
    //Бренд
    //Submit form data to end point
    const handlerClickSubmit = () => {
        console.log("submit data");
        submit(updateData, { method: "post", action: `/models/${model.id}/edit/upload`, navigate: false });
    }
    //For handle text field change events
    const changeDataHandler = (prop: TextFieldChangeType, e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value } } = e;
        let changedData = updateData;
        switch (prop) {
            case "oldPrice":
            case "price":
                changedData[prop] = +value;
                break;
            default:
                changedData[prop] = value;
        }
        SetUpdateData(changedData);
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
                if (surf) {
                    updateData.surfaceId = surf.id;
                    SetSurface(surf.surfaceName);
                }
                break;
            case "sexId":
                const sex = sexList.find((sex) => sex.name === value);
                if (sex) {
                    updateData.sexId = sex.id;
                    SetSex(sex);
                }

        }
        SetUpdateData(updateData);
    }
    return (
        <Box sx={{ width: 400 }}>
            <Form method="get">
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
                    multiline
                    maxRows={6}
                    sx={{
                        m: 1
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeDataHandler("description", e)}
                />
                <TextField
                    defaultValue={model.color}
                    id="id-color"
                    label="Цвет"
                    variant="outlined"
                    required
                    sx={{
                        m: 1
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeDataHandler("color", e)}
                />
                <TextField
                    defaultValue={model.price}
                    id="id-price"
                    label="Цена"
                    variant="outlined"
                    required
                    type="number"
                    sx={{
                        m: 1
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeDataHandler("price", e)}
                />
                <TextField
                    defaultValue={model.oldPrice}
                    id="id-old-price"
                    label="Старая цена"
                    variant="outlined"
                    required
                    type="number"
                    sx={{
                        m: 1
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeDataHandler("oldPrice", e)}
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
                    popEntityList={surfaces.map((s) => ({ key: s.id, value: s.surfaceName }))}
                    value={surface}
                    popListData={{ name: "surface", id: "id_surface", label_id: "label-surface" }}
                    outlineLabel="Специализация"
                    sx={{ m: 1 }}
                    handlerSelect={(e: SelectChangeEvent<string>) => selectChangeHandler("surfaceId", e)}
                />
                <PopListComponent
                    popEntityList={Array.from(sexList, (sex) => sex.name ? {
                        key: sex.id, value: sex.name
                    } : {
                        key: sex.id,
                        value: ""
                    }
                    )}
                    popListData={{ name: "sex", id: "id_sex", label_id: "label-sex" }}
                    value={sex ? sex.name ? sex.name : "" : ""}
                    outlineLabel="Пол"
                    sx={{ m: 1 }}
                    handlerSelect={(e: SelectChangeEvent<string>) => selectChangeHandler("sexId", e)}
                />
            </Form>
            <Stack direction="row" sx={{ margin:[1,0,1,1] ,p:1, border:"0.1px gray solid" }}>
                <Typography variant="body1" color="sucess" sx={{font:"italic bold 1.2rem \"Roboto\"", flex:1}}>
                   Размеры: {model.modelItems.map((item, inx) => {
                        let res = item.size;
                        if (inx != model.modelItems.length - 1) {
                            res += ", ";
                        }
                        return res;
                    })}
                </Typography>
                <Link to={`/itemsCreater/${model.id}`}>
                    <Button variant="contained" sx={{ marginTop:0.5 , flex:0 }}>
                        Позиции
                    </Button>
                </Link>
            </Stack>
            <Form method="post" encType="multipart/form-data">
                <Box >
                    <ImageList images={imageList} />
                </Box>
                <Box m={1}>
                    <Button sx={{ marginRight: 1 }} variant="contained" type="submit" name="submiBtn" onClick={handlerClickSubmit}>
                        Сохранить изменения
                    </Button>
                    <Button onClick={() => { navigate("/admin") }} variant="outlined">
                        Назад
                    </Button>
                </Box>
            </Form>
            <Outlet />
        </Box>
    );
}

function castCatoriesToPopEntity(categories: ProductCategory[]): PopEntity[] {
    const result: PopEntity[] = [];
    for (let cat of categories) {
        const add: PopEntity = { key: cat.id, value: cat.categoryName }
        result.push(add);
    }
    return result;
}