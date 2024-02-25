import { Label } from "@mui/icons-material";
import { Box, Button, SelectChangeEvent, TextField, TextFieldProps, Typography, styled } from "@mui/material";
import { isNumber } from "@mui/x-data-grid/internals";
import { Item, ProductModel, Sex, TableOfSizes } from "@prisma/client";
import { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, MetaFunction, NodeOnDiskFile, json, redirect, unstable_createFileUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node"
import { Form, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { ChangeEvent, ChangeEventHandler, useState } from "react";
import invariant from "tiny-invariant"
import { ImageList } from "~/components/ImageList";
import PopListComponent, { PopEntity } from "~/components/PopListComponent";
import { db } from "~/utils/db.serves";
import path from "path"
import fs from "fs"
import style from "~/styles/styles.css"


export const meta: MetaFunction = () => [
    {
        title: "Исправить позицию",
    }
]
//defined additinal types 
type CustomFormData = Omit<Item, "id" | "images">;
type TextFieldData = Exclude<keyof CustomFormData, "modelId" | "sexId" | "size">
type SelectInputData = Exclude<keyof CustomFormData, TextFieldData>;
type TableOfSizeCustom = Omit<TableOfSizes, "sizes_uk" | "id" | "sizes_eu" | "sizes_cm"> & { size_list: string[] };

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "Missing id item");
    const item = await db.item.findUnique({ where: { id: +params.id }, include: { productModel: true, sex: true } });
    invariant(item, "Dont find in db item with " + params.id + " id");
    //get all product models 
    const productModels = await db.productModel.findMany({});
    const sexList = await db.sex.findMany({});
    const size_list = await db.tableOfSizes.findMany();
    //
    const tableSizeList: TableOfSizeCustom[] = [];
    for (const sizes of size_list) {
        let add: TableOfSizeCustom = { ...sizes, size_list: sizes.sizes_us ? sizes.sizes_us.split(';') : [] };
        tableSizeList.push(add);
    }
    return json({ item, productModels, sexList, tableSizeList });
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.id, "Missing id");
    const updataItem = await db.item.findUnique({
        where: {
            id: +params.id,
        },
        include: {
            productModel: true,
            sex: true
        }
    });
    //Получить имеюшиеся файлы 
    invariant(updataItem, "Not found item on item id " + params.id);
    const imageList = Array<string>(5).fill("");
    if (updataItem.images) {
        //Get list all images from db
        const dbImages = updataItem.images.split(';');
        for (let image of dbImages) {
            const baseName = path.basename(image, path.extname(image));
            const reg = /_([0-9]+)(-[0-9]+)*/;
            const match = baseName.match(reg);
            const fullName = `${process.cwd()}/public/${image}`;
            const stat = fs.existsSync(fullName);
            if (match && stat ) {
                const index_to_replace = +match[1];
                imageList.splice(index_to_replace, 1, image);
            }
        }
    }

    const uploadHandler = unstable_createFileUploadHandler({
        directory: `public/images/items/${updataItem.id}`,
        file: ({ filename, name }) => {
            const ext = path.extname(filename);
            return `${name}${ext}`;
        }
    });
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    for (let i = 0; i < 5; i++) {
        const name = `img_file_${i}`;
        const file = formData.get(name);
        if (file) {
            const fileNode = file as NodeOnDiskFile;
            //Get old name of file 
            const oldFileName = `${process.cwd()}/public/${imageList[i]}`;
            const stat = fs.existsSync(oldFileName);
            if (imageList[i] && stat ) {
                //echange extensions
                const extNew = path.extname(fileNode.name);
                fs.rmSync(oldFileName);
                const pathToFile = path.dirname(oldFileName);
                const newName = path.normalize(`${pathToFile}/${name}${extNew}`);
                if (newName !== fileNode.getFilePath()) {
                    fs.renameSync(fileNode.getFilePath(), newName);
                }
                //
                imageList.splice(i, 1, `/images/items/${updataItem.id}/${name}${extNew}`);
            } else {
                imageList.splice(i, 1, `/images/items/${updataItem.id}/${fileNode.name}`);
            }
        }
    }
    if (imageList.length > 0) {
        await db.item.update({
            where: {
                id: +params.id,
            }, data: {
                images: imageList.join(';')
            }
        })
    }
    return redirect("/admin");
}

export default function ItemEdit() {
    const { item, productModels, sexList, tableSizeList } = useLoaderData<typeof loader>();
    const [customFormData, SetCustomFormData] = useState<CustomFormData>(item);
    const [popEntity, SetPopEntity] = useState<string | undefined>(item.productModel ? item.productModel.name : undefined);
    //state for select sex 
    const [sex, SetSex] = useState<Sex | null>(item.sex);
    //find size table for current selected sex
    const szTable = tableSizeList.find((sz) => sz.sexId === sex?.id);
    const [curentSizeTable, SetSizeTable] = useState<string[] | undefined>(szTable?.size_list);
    const [size, SetSize] = useState<string>(item.size ? item.size : "");
    const imageList = item.images ? item.images.split(';') : [];
    //submit for update dat in other special route
    const submit = useSubmit();
    //for event on cancel button
    const navigate = useNavigate();
    //handler for price change event
    const handlerChangeInput = (changePropName: TextFieldData, e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value } } = e;
        let data = customFormData;
        switch (changePropName) {
            case "color":
                data.color = value;
                break;
            case "quantity":
                data.quantity = +value; break;
            case "price":
                data.price = +value; break;
            case "oldPrice":
                data.oldPrice = +value; break;
        }
        SetCustomFormData(data);
    }
    //handler for change event on buttun and submit data to item/id/edit/update
    const handlerSubmitClick = () => {
        //fill form data and move to action function
        submit(customFormData,
            {
                method: "post",
                action: `/item/${item.id}/edit/update`,
                encType: "multipart/form-data",
                navigate: false
            });
    }
    //handler for select model
    const selectModelHandler = (propName: SelectInputData, e: SelectChangeEvent<string>) => {
        const { target: { value } } = e;
        switch (propName) {
            case "modelId":
                const model = productModels.find((model) => model.name);
                if (model) {
                    customFormData.modelId = model.id;
                    SetPopEntity(value);
                    SetCustomFormData(customFormData);
                }
                break;
            case "size":
                SetSize(value);
                customFormData.size = value;
                break;
            case "sexId":
                const sex = sexList.find((sex) => sex.name === value);
                if (sex) {
                    SetSex(sex);
                    customFormData.sexId = sex.id;
                    SetCustomFormData(customFormData);
                    //change table of size
                    const szTable = tableSizeList.find((sz) => sz.sexId === sex?.id);
                    SetSizeTable(szTable?.size_list);
                }
                break;
        }
    }
    return (
        <Box>
            <Form method="get">

                <Box sx={{
                    width: 300
                }}
                    id="item-input-field-box">

                    <TextFieldCustom
                        defaultValue={item.quantity ? item.quantity : ""}
                        label="Количество"
                        variant="outlined"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handlerChangeInput("quantity", e)}
                        type="number"
                        required
                        size="medium"
                    />
                    <TextFieldCustom
                        defaultValue={item.color}
                        label="Цвет"
                        variant="outlined"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handlerChangeInput("color", e)}
                        type="text"
                        required
                    />
                    <TextFieldCustom
                        defaultValue={item.price}
                        label="Цена"
                        variant="outlined"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handlerChangeInput("price", e)}
                        type="number"
                        required
                    />
                    <TextFieldCustom
                        defaultValue={item.oldPrice}
                        label="Старая цена"
                        variant="outlined"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handlerChangeInput("oldPrice", e)}
                        type="number"
                        required
                    />
                    <PopListComponent
                        popEntityList={CastProductModelsToPopEntities(productModels)}
                        popListData={{ name: "models", id: "id-model-pop-up", label_id: "id-lebel-models" }}
                        value={(productModels.find((model) => model.id === customFormData.modelId))?.name}
                        outlineLabel="Модель продукта"
                        handlerSelect={(e: SelectChangeEvent<string>) => selectModelHandler("modelId", e)}
                        sx={{ m: 1, width: 300 }}
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
                        handlerSelect={(e: SelectChangeEvent<string>) => selectModelHandler("sexId", e)}
                    />
                    {
                        curentSizeTable === undefined ?
                            <Typography variant="h6" >Выбраный пол не имеет таблицу размеров</Typography>
                            : <PopListComponent
                                popEntityList={curentSizeTable.map((sz, index) => ({ key: index, value: sz }))}
                                value={size}
                                popListData={{ name: "size", id: "size-id", label_id: "size-label-id" }}
                                outlineLabel="Размер"
                                handlerSelect={(e: SelectChangeEvent<string>) => selectModelHandler("size", e)}
                                sx={{ m: 1 }}
                            />
                    }
                </Box>
            </Form>
            <Form method="post" encType="multipart/form-data">
                <Box sx={{ my: 2, mx: 1 }}>
                    <ImageList images={imageList} />
                </Box>
                <Box m={1} id="button-box">
                    <Button type="submit" sx={{ mx: 1 }} variant="contained" onClick={handlerSubmitClick}>Сохранить</Button>
                    <Button variant="outlined" onClick={() => navigate("/admin")}>Отменить</Button>
                </Box>
            </Form>
        </Box>
    )
}

function CastProductModelsToPopEntities(models: ProductModel[]): PopEntity[] {
    const result: PopEntity[] = [];
    for (const model of models) {
        result.push({ key: model.id, value: model.name });
    }
    return result;
}
const TextFieldCustom = styled(TextField)<TextFieldProps>(({ theme }) => ({
    width: 300,
    margin: 10,
}));
