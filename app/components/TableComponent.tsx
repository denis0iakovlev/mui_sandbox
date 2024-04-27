import { GridColDef, GridRowSelectionModel, GridCallbackDetails, DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Button, Stack } from "@mui/material";
import { Form } from "@remix-run/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import  type {TablesTypes} from "~/utils/db.adminPage.utils"

export type ActionVariant = "new" | "delete" | "copy_from";

export default function TableComponent(
    { type, title, rows, columns }: {
        type: TablesTypes,
        title: string,
        rows: Array<Object>,
        columns: Array<GridColDef>
    }
) {
    const [ids, SetSelectedIds] = useState<number[]>([]);
    //Обработчик для выбираемых позиций в таблице
    const rowSelectionHandler = (rowSelection: GridRowSelectionModel, details: GridCallbackDetails) => {
        let selectedBrands: number[] = [];
        rowSelection.map((rowSel) => {
            console.log(rowSel);
            let inx = (rowSel as number);
            if (inx) {
                console.log(inx);
                selectedBrands.push(inx);
            }
        });
        SetSelectedIds(selectedBrands);
    }

    return (
        <Box >
            <Typography variant="h5"
                borderBottom={"1px solid red"}>
                {title}
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                onRowSelectionModelChange={rowSelectionHandler}
                rowHeight={20}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 15,
                        },
                    },
                }}
            >
            </DataGrid>
            <Stack direction="row"
                sx={{ my: "10px", borderBottom: "1px solid",display:"flex", p:1,  justifyContent:"end" }} >
                <Form method="post" >
                    <input
                        type="text"
                        hidden
                        name="to_delete_list"
                        value={
                            ids.join(',')
                        }
                        readOnly />
                    <input
                        type="hidden"
                        name="type_table"
                        value={type}
                        readOnly
                    />
                    {
                        ids.length === 0 ?
                            (
                                <Button
                                    type="submit"
                                    name="_action"
                                    value="new"
                                    variant="contained"
                                >
                                    New
                                </Button>
                            ) :

                            (
                                <>
                                    <Link to={`/${type}/${ids[0]}/edit`}>
                                        <Button
                                            disabled={ids.length !== 1}
                                        >
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button name="_action"
                                        type="submit"
                                        value="delete"
                                    >
                                        Delete
                                    </Button>
                                    <Button 
                                        name="_action"
                                        type="submit"
                                        value={"copy_from"}
                                        disabled={ids.length !== 1}
                                    >
                                        <input type="hidden" name="copy_from" value={ids[0]} />
                                        Copy from
                                    </Button>

                                </>
                            )
                    }
                </Form>
            </Stack>
        </Box>
    )
}