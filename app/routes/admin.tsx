import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData, Outlet, Link, Form, useActionData } from "@remix-run/react";
import { GridCallbackDetails, GridColDef, GridRowSelectionModel, } from "@mui/x-data-grid";
import { Box, Button, Divider, IconButton, Snackbar, Typography } from "@mui/material";
import TableComponent, { ActionVariant } from "~/components/TableComponent"
import invariant from "tiny-invariant";
import { getAllCategories, TablesTypes, createEmptyDbRecord, deleteRecordOnId, getBrandList, getAllProductModels, getAllItems, createAndCopyFrom } from "~/utils/db.adminPage.utils";
import { db } from "~/utils/db.serves";
import { useEffect, useState } from "react";
import { Close } from "@mui/icons-material";
import { Item } from "@prisma/client";

type ErrorAction = {
    table: string,
    message: string,
}

export const loader = async () => {
    //Получить все Бренды
    const brandData = await getBrandList();
    const categories = await getAllCategories();
    const models = await getAllProductModels();
    const items = await getAllItems();
    const surfaces = await db.surface.findMany({});
    //Get all table of sex records
    const sex_list = await db.sex.findMany({});
    //Get all tables of sizing
    const tableOfSizeList = await db.tableOfSizes.findMany({ include: { sex: true } });
    //отправить в виде ответа в визуальную часть 
    return json({ brandData, categories, models, items, sex_list, tableOfSizeList, surfaces });
}
export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const actionData = Object.fromEntries(formData);
    let errorAction: ErrorAction | undefined = undefined;
    let typeTable = actionData.type_table as TablesTypes;
    console.log(typeTable);
    try {

        if (typeof actionData._action !== "string") {
            invariant(false, "Missing form data");
        }
        const action = actionData._action as string;
        //all tables have name table
        switch (action) {
            case "new":
                const newDbRecord = await createEmptyDbRecord(typeTable);
                return redirect(`/${typeTable}/${newDbRecord.id}/edit`);

            case "delete":
                const delete_list_id = (actionData.to_delete_list as string).split(',');
                for (const id of delete_list_id) {
                    const toDeleteId = +id;
                    await deleteRecordOnId(typeTable, toDeleteId);
                }
                break;
            case "copy_from":
                const sourceId = +actionData.copy_from;
                const newRecord = await createAndCopyFrom(typeTable, sourceId);
                return redirect(`/${typeTable}/${newRecord}/edit`);
        }
    } catch (e) {
        const error = e as Error;
        if (error) {
            errorAction = { table: typeTable, message: e.message }
        } else {
            errorAction = { table: typeTable, message: e as string }
        }
    }
    return json({ errorAction });
}

export default function AdminPanel() {
    const { brandData, categories, models, items, sex_list, tableOfSizeList, surfaces } = useLoaderData<typeof loader>();
    const data = useActionData<typeof action>();
    useEffect(() => {
        if (data?.errorAction?.message) {
            SetOpen(true);
        }
    }, [data])
    const [open, SetOpen] = useState(false);
    const handleClick = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway')
            return;
        SetOpen(false);
    }
    //Сохраняем сюда данный
    return (
        <Box sx={{
            p: 3,
            m: 1
        }}>
            {
                data?.errorAction?.message ?
                    <Snackbar
                        open={open}
                        autoHideDuration={6000}
                        message={data?.errorAction?.message}
                        onClose={handleClick}
                    />
                    : null
            }
            <TableComponent
                type="categories"
                title="Категории товаров"
                rows={categories}
                columns={columnsOfCategories}
            />
            <Divider orientation="horizontal" variant="middle" />
            <TableComponent
                type="brands"
                title="Бренды"
                rows={brandData}
                columns={columnsOfBrands}
            />
            <Divider orientation="horizontal" variant="middle" />
            <TableComponent
                type="models"
                title="Модель"
                rows={models}
                columns={columnsOfModels}
            />
            <TableComponent
                type="sex"
                title="Пол"
                rows={sex_list}
                columns={columnsOfSex}
            />
            <TableComponent
                type="tableOfSize"
                title="Таблицы размеров"
                rows={tableOfSizeList}
                columns={columnsOfTableSizes}
            />
            <TableComponent
                type="surface"
                title="Специализация"
                rows={surfaces}
                columns={columnOfSurface}
            />
        </Box >
    );
}

const columnsOfBrands: GridColDef[] = [
    { field: 'id', headerName: "ID", width: 60 },
    { field: "brandName", headerName: "Бренд", width: 120 },
    { field: "categoriesName", headerName: "Категория", width: 120 }
]
const columnsOfCategories: GridColDef[] = [
    { field: 'id', headerName: "ID", width: 60 },
    { field: "categoryName", headerName: "Категория", width: 120 },
    { field: "relatedBrands", headerName: "Представленно в брендах", width: 180 }
]
//колнки для моделей продукта
const columnsOfModels: GridColDef[] = [
    { field: 'id', headerName: "Id", width: 40 },
    { field: 'designation', headerName: "Обозначение", width: 250 ,align: "left", headerAlign: "center",
        valueGetter:(params)=>{
            let design = "";
            if(params.row.brendName){
                design +=  params.row.brendName;
            }
            if(params.row.name){
                design += " " + params.row.name;
            }
            return design;
        }
    },
    { field: 'sizes', headerName: "Размеры",headerAlign:"center", width: 150,
        valueGetter:(params)=>{
            if(params.row.modelItems){
                const itemsList = params.row.modelItems as Item[];
                let sizes = "";
                for(let i =0;i < itemsList.length; i++){
                    if(i != itemsList.length-1){
                        sizes += `${itemsList[i].size}, `;
                    }else{
                        sizes += itemsList[i].size;
                    }
                }
                return sizes;
            }else{
                return "Нет позиций"
            }
        }
     },
    { field: 'color', headerName: "Цвет",headerAlign:"center", align:"center", width: 150 },
    {
        field: 'sexId', headerName: "Пол", width: 150,headerAlign:"center", align:"center",valueGetter: (params) => {
            if (params.row.sex) {
                return params.row.sex.name;
            } else {
                return "Пол не установлен"
            }
        }
    },
    {
        field: 'surface', headerName: "Специализация", align: "center", headerAlign: "center", valueGetter: (params) => {
            if (params.row.surface) {
                return params.row.surface.surfaceName;
            } else {
                return "Не задано";
            }
        }
    },
    { field: 'description', headerName: "Описание" },
    { field: 'categoryName', headerName: "Категория", width: 150, },
]
//колнки для моделей продукта
const columnsOfItems: GridColDef[] = [
    { field: 'id', headerName: "Id", width: 60, type: "number" },
]
//columns for show sex table
const columnsOfSex: GridColDef[] = [
    { field: 'id', headerName: "Id", width: 60, type: "number" },
    { field: 'name', headerName: "Пол", width: 120 },
    {
        field: 'productModel', headerName: "Представлено в", width: 400,
        valueGetter: (params) => {
            if (params.row['ProductModel']) {
                if (Object.hasOwn(params.row, 'ProductModel')) {
                    if (Array.isArray(params.row['ProductModel'])) {
                        return Array.from(params.row['ProductModel'], (product) => product['name']);
                    }
                }
            }
            return "Нет связанных моделей";
        }
    },
]
//columns for show table of size
const columnsOfTableSizes: GridColDef[] = [
    { field: 'id', headerName: "Id", width: 60, type: "number" },
    { field: 'sizes_us', headerName: "Us", width: 120 },
    { field: 'sizes_eu', headerName: "Uk", width: 120 },
    {
        field: 'sexName2', headerName: "Пол", width: 120, valueGetter: (params) => {
            if (Object.hasOwn(params.row, 'sex')) {
                if (params.row['sex'] !== null) {
                    return params.row['sex']['name'];
                }
            }
            return 'Пол не указан';
        },
    },
]
const columnOfSurface: GridColDef[] = [
    { field: 'id', headerName: "Id", width: 60, type: "number" },
    { field: 'surfaceName', headerName: "Для какого покрытия", width: 200, type: "string" },
]