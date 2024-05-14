import { CheckBox } from "@mui/icons-material";
import { Box, Button, Checkbox, Paper, SelectChangeEvent, Stack, Typography } from "@mui/material";
import {
    DataGrid, GridColDef, GridRowModesModel, GridRowsProp, GridActionsCellItem, GridRowModes, GridRowId, GridRowModel, GridEventListener, GridRowEditStopReasons, GridToolbarContainer, GridFooterContainer,
} from "@mui/x-data-grid";
import { Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { Item, ProductModel, TableOfSizes } from "@prisma/client";
import { Select } from "@prisma/client/runtime/library";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useActionData, useFetcher, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import PopListComponent, { PopEntity } from "~/components/PopListComponent";
import { db } from "~/utils/db.serves"
import invariant from "tiny-invariant";

type ActionType = "create" | "update" | "delete";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.modelId, "Missing model id");
    const model = await db.productModel.findUnique({
        where: {
            id: +params.modelId,
        },
        include: {
            modelItems: true,
            sex: {
                include: {
                    TableOfSizes: true
                }
            }
        }
    });
    invariant(model, "Not found model on id");
    //
    let sizes: string[] = [];
    if (model.sex && model.sex.TableOfSizes.length > 0) {
        if (model.sex.TableOfSizes[0].sizes_us) {
            sizes = model.sex.TableOfSizes[0].sizes_us.split(';')
        }
    }
    const items: Item[] = model.modelItems;

    return json({ items, sizes });
}
export const action = async ({ request, params }: ActionFunctionArgs) => {
    invariant(params.modelId, "Missing model id");
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const action = data.action as ActionType;
    let errors = { error: "" };
    try {
        const id: number = +data.id;
        switch (action) {
            case "update":
                invariant(data.size, "Dont set size");
                await db.item.update({
                    where: {
                        id,
                    }, data: {
                        size: data.size as string,
                    }
                });
                break;
            case "create":
                await db.item.create({
                    data: {
                        modelId: +params.modelId
                    }
                });
                break;
            case "delete":
                await db.item.delete({ where: { id } });
                break;
            default:
                invariant(false, `action ${action} not handling`);
        }
        console.log(data);
    } catch (e) {
        console.log(e);
        const error = e as Error;
        if (error) {
            errors.error = error.message;
        }
    }
    const err = errors;
    return json({ err });
}

function EditToolbar() {
    const fetcher = useFetcher();
    const handleClick = () => {
        fetcher.submit({ action: "create" }, { method: "post" });
    }
    return (
        <GridToolbarContainer>
            <Stack direction="row" >
                <Button color="primary" startIcon={<Add />} onClick={handleClick}>
                    Add record
                </Button>
            </Stack>
        </GridToolbarContainer>
    );
}

export default function ItemsCreater() {
    const { items, sizes } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const [rows, SetRows] = useState(items);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const data = fetcher.data;
    const navigate = useNavigate();
    const params = useParams();
    //
    useEffect(() => {
        SetRows(items)
    }, [items])
    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };
    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
    }
    const handleRowModesModelDelete = (id: GridRowId) => () => {
        console.log(`delete ${id}`);
        const formData = { id: id, action: "delete" };
        SetRows(rows.filter((r) => r.id !== id));
        fetcher.submit(formData, { method: "post" });
    }
    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };
    //send to server form
    const processRowUpdate = (newRow: GridRowModel) => {
        const updatedRow = { ...newRow, isNew: false };
        const formData = { ...newRow, action: "update" };
        fetcher.submit(formData, { method: "post" });
        SetRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };
    //
    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };
    const columnOfItems: GridColDef[] = [
        { field: "id", headerName: "Id", width: 40, type: "number" },
        { field: "modelId", headerName: "Id модели", width: 90 },
        { field: "size", headerName: "Размер", width: 80, editable: true, type: "singleSelect", valueOptions: sizes },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<Save />}
                            label="Save"
                            onClick={handleSaveClick(id)}
                            sx={{
                                color: 'primary.main',
                            }}

                        />,
                        <GridActionsCellItem
                            icon={<Cancel />}
                            label="Cancel"
                            className="textPrimary"

                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<Edit />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<Delete />}
                        onClick={handleRowModesModelDelete(id)}
                        label="Delete"
                        color="inherit"
                    />,
                ];
            },
        },
    ]
    //
    return (
        <Box width="min-content" m="0 auto">
            {
                data?.err ? <Typography color="error">
                    {data.err.error}
                </Typography>
                    : ""
                }
            <DataGrid
                rows={rows}
                columns={columnOfItems}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                processRowUpdate={processRowUpdate}
                onRowEditStop={handleRowEditStop}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 15,
                        },
                    },
                }}
                slots={{
                    toolbar: EditToolbar,
                }}
                />
            <Button onClick={()=>{
                const url = `/models/${params.modelId}/edit`;
                navigate(url);
                }}>
                Вернуться к модели
            </Button>
        </Box>
    )
}