import { Box, Button, Paper, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, styled } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Form, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { ArrowDownward } from '@mui/icons-material';
import React, { useState } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { db } from "~/utils/db.serves";
import PopListComponent, { PopEntity } from "~/components/PopListComponent";
import { Sex, TableOfSizes } from "@prisma/client";

type ClickButtinType = "add" | "delete"
type RowSizeData = {
    us_sz: string,
    uk_sz: string,
    eu_sz: string,
    cm_sz: string,
}
interface TableOfSizeCustom extends TableOfSizes {
    sizeTable: RowSizeData[],
}
export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "wrong id for table of size");
    const tableOfSize = await db.tableOfSizes.findUnique({
        where: {
            id: +params.id
        }, include: {
            sex: true
        }
    });
    //

    const sexList = await db.sex.findMany();
    if (tableOfSize == null) {
        throw "dont findobject with id " + params.id;
    }
    //
    let tableOfSizeCustom: TableOfSizeCustom = { ...tableOfSize, sizeTable: [] };
    if (!tableOfSize.sizes_us || !tableOfSize.sizes_uk || !tableOfSize.sizes_eu || !tableOfSize.sizes_cm) {
        return json({tableOfSizeCustom, sexList});
    }
    const us_sz_list = tableOfSize.sizes_us.split(';');
    const uk_sz_list = tableOfSize.sizes_uk.split(';');
    const eu_sz_list = tableOfSize.sizes_eu.split(';');
    const cm_sz_list = tableOfSize.sizes_cm.split(';');
    for (let i = 0; i < us_sz_list.length; i++) {
        let add: RowSizeData = {
            ...tableOfSize,
            us_sz: us_sz_list[i],
            uk_sz: uk_sz_list[i],
            cm_sz: cm_sz_list[i],
            eu_sz: eu_sz_list[i],
        }
        tableOfSizeCustom.sizeTable.push(add);
    }
    //Get all sex recorde for select
    return json({ tableOfSizeCustom, sexList });
}
//handle p[ost action ]
export const action = async ({ params, request }: ActionFunctionArgs) => {
    invariant(params.id, "Wrong id for table of size");
    const formData = await request.formData();
    const formObj = Object.fromEntries(formData);
    const us_size_list = formData.getAll("us_size") as string[];
    const uk_size_list = formData.getAll("uk_size") as string[];
    const eu_size_list = formData.getAll("eu_size") as string[];
    const cm_size_list = formData.getAll("cm_size") as string[];
    invariant(uk_size_list.length === us_size_list.length, "Thre is not completed data");
    invariant(eu_size_list.length === us_size_list.length, "Thre is not completed data");
    invariant(cm_size_list.length === us_size_list.length, "Thre is not completed data");
    //get sex id
    let sexId: number = -1;
    if (formObj.sex_list) {
        const sexList = await db.sex.findMany();
        const selected = sexList.find((s) => s.name === formObj.sex_list);
        if (selected) {
            sexId = selected.id;
        }
        //updata db
        type DataType = Omit<TableOfSizes, "sexId" |"id"> & {sexId?:Object};
        let data:DataType = {
            sizes_us: us_size_list.join(';'),
            sizes_uk: uk_size_list.join(';'),
            sizes_cm: cm_size_list.join(';'),
            sizes_eu: eu_size_list.join(';'),
        };
        if(sexId > 0 ){
            data.sexId = {set:sexId};    
        }
        await db.tableOfSizes.update({
            where: {
                id: +params.id,
            },
            data
        })
    }
    return redirect("/admin");
}
export default function TableOfSize() {
    const data = useActionData<typeof action>();
    const { tableOfSizeCustom, sexList } = useLoaderData<typeof loader>();
    //for pop up list
    const sexOfTable = sexList.find((sex) => sex.id === tableOfSizeCustom.sexId);
    const [sexValue, SetSexValue] = useState<Sex | undefined>(sexOfTable);
    //
    const navigate = useNavigate();
    const [rowCounter, SetRowCounter] = useState<number>(tableOfSizeCustom.sizeTable.length < 2 ? 2 : tableOfSizeCustom.sizeTable.length);
    const clickChangeRowHandler = (typeClick: ClickButtinType, e: React.MouseEvent<HTMLButtonElement>) => {
        let newCounter = rowCounter;
        switch (typeClick) {
            case "add":
                newCounter++;
                break;
            case "delete":
                if (newCounter > 2) {
                    newCounter--;
                }
                break;
        }
        SetRowCounter(newCounter);
    }
    //handler for change selected sex
    const changeSex = (e: SelectChangeEvent<string>) => {
        const {
            target: { value }
        } = e;
        const selected = sexList.find((s) => s.name === value);
        if (selected) {
            SetSexValue(selected)
        }

    }
    return (
        <Box sx={{ width: 600 }}>
            <Typography sx={{ color: "theme.palette.seconadary" }}>
                Изменить данные таблицы размеров
            </Typography>
            <Form method="post">
                <PopListComponent
                    popEntityList={CastSexListToPopList(sexList)}
                    popListData={{ name: "sex_list", id: "sex-id", label_id: "sex-lebel-id" }}
                    value={sexValue?.name ? sexValue.name : ""}
                    outlineLabel="Пол"
                    handlerSelect={changeSex}
                />
                <TableContainer component={Paper} sx={{ width: 600 }} elevation={4}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>US</TableCell>
                                <TableCell>UK</TableCell>
                                <TableCell>EU</TableCell>
                                <TableCell>Cm</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                Array(rowCounter).fill(0).map((some, index) => {
                                    if (index < tableOfSizeCustom.sizeTable.length) {
                                        return <CreateTableRow index={index} rowData={tableOfSizeCustom.sizeTable[index]} />;
                                    } else {
                                        console.log("redraw")
                                        return <CreateTableRow index={index} rowData={{ us_sz: "10", uk_sz: "9.5", eu_sz: "43.5", cm_sz: '28' }} />;
                                    }
                                })
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box m={2}>
                    <Button
                        variant="contained"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => clickChangeRowHandler("add", e)} startIcon={<ArrowDownward />}
                        sx={{ mx: 3 }}>
                        Добавить
                    </Button>
                    <Button
                        variant="contained"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => clickChangeRowHandler("delete", e)} startIcon={<ArrowDownward />}
                    >Удалить
                    </Button>
                </Box>
                <Box m={5} >
                    <Button type="submit" variant="contained" sx={{ color: 'theme.palette.secondary', mx: 3 }}>Сохранить</Button>
                    <Button variant="outlined" onClick={() => navigate("/admin")} sx={{ color: 'theme.palete.error' }}>Отменить</Button>
                </Box>
            </Form>
        </Box>
    )
};

function CreateTableRow({ index, rowData }: { index: number, rowData?: RowSizeData }) {
    const [data, SetData] = useState<RowSizeData>(rowData ? rowData : { us_sz: "10", uk_sz: "9.5", eu_sz: "43.5", cm_sz: '28' });
    const changeHandler = (prop: keyof RowSizeData, e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = data;
        const {
            target: { value }
        } = e;
        console.log(value);
        switch (prop) {
            case "us_sz":
                newData.us_sz = value;
                let elem = document.getElementById(`size-uk-id-${index}`) as HTMLInputElement;
                if (elem) {
                    elem.value = (+newData.us_sz - 0.5).toString();
                }
                newData.uk_sz = (+newData.us_sz - 0.5).toString();
                //
                elem = document.getElementById(`size-cm-id-${index}`) as HTMLInputElement;
                if (elem) {
                    elem.value = (+newData.us_sz + 34).toString();
                }
                newData.cm_sz = (+newData.us_sz + 34).toString();
                //
                elem = document.getElementById(`size-eu-id-${index}`) as HTMLInputElement;
                if (elem) {
                    elem.value = (+newData.us_sz + 18).toString();
                }
                newData.eu_sz = (+newData.us_sz + 18).toString();
                break;
            case "uk_sz":
                newData.uk_sz = value;
                break;
            case "cm_sz":
                newData.cm_sz = value;
                break;
            case "eu_sz":
                newData.eu_sz = value;
                break;
        }
        console.log(newData);
        SetData(newData);
    }
    return (
        <TableRow>
            <TableCell key={`${index}-us`}>
                <TextField
                    name="us_size"
                    type="number"
                    size="small"
                    defaultValue={data.us_sz}
                    placeholder="1.0"
                    inputProps={{ 'step': '0.5' }}
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeHandler("us_sz", e)}
                />
            </TableCell>
            <TableCell key={`${index}-uk`}>
                <TextField
                    name="uk_size"
                    id={`size-uk-id-${index}`}
                    type="number"
                    size="small"
                    defaultValue={data.uk_sz}
                    placeholder="1.0"
                    inputProps={{ 'step': '0.5' }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeHandler("uk_sz", e)}
                    required />
            </TableCell>
            <TableCell key={`${index}-eu`}>
                <TextField
                    name="eu_size"
                    type="number"
                    id={`size-eu-id-${index}`}
                    size="small"
                    defaultValue={data.eu_sz}
                    placeholder="1.0"
                    inputProps={{ 'step': '0.5' }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeHandler("eu_sz", e)}
                    required />
            </TableCell>
            <TableCell key={`${index}-cm`}>
                <TextField
                    name="cm_size"
                    type="number"
                    id={`size-cm-id-${index}`}
                    size="small"
                    defaultValue={data.cm_sz}
                    placeholder="1.0"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeHandler("cm_sz", e)}
                    inputProps={{ 'step': '0.5' }}
                    required />
            </TableCell>
        </TableRow>
    )
}

function CastSexListToPopList(sexList: Sex[]) {
    const result: PopEntity[] = [];
    for (const sex of sexList) {
        if (sex.name) {
            result.push({ key: sex.id, value: sex.name });
        }
    }
    return result;
}
