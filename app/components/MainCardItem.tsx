import { Add, ShoppingBasketOutlined } from "@mui/icons-material";
import { Paper, Typography, Box, Button, useTheme, IconButton, TextField } from "@mui/material";
import { Brand, Item, ProductModel, Surface } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";

export default function MainCardItem({ product }: {
   /* product: ProductModel &
    { brend: Brand, surface: Surface, modelItems: Item[] }*/
     product:any
}) {
    const [selectedItem, SetSelectedItem] = useState<boolean[]>(Array(product.modelItems.length));
    const [addBtnEnable, SetAddBtnEnable] = useState<boolean>(false);
    const fetcher = useFetcher();
    const theme = useTheme();
    const handlerClickSize = (inx: number) => {
        const copy = selectedItem.slice();
        copy[inx] = !copy[inx];
        SetSelectedItem(copy);
        //Set enable btn
        let oneIsSel = false;
        for (let selItem of copy) {
            if (selItem) {
                oneIsSel = true;
                break;
            }
        }
        SetAddBtnEnable(oneIsSel);
        const element = document.getElementById("item-id-list") as HTMLInputElement;
        if (element) {
            const val = [];
            for (let i = 0; i < copy.length; i++) {
                if (copy[i]) {
                    val.push(product.modelItems[i].id);
                }
            }
            element.value = val.join();
            console.log(element.value);
        } else {
            console.log("element for id isniot found");
        }
    }
    return (
        <Paper sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }}>
            <fetcher.Form method="post">
                <Box p={2} sx={{
                    justifySelf: "self-start",
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <Typography variant="h6">
                        {`${product.brend.brandName} ${product.name} `}
                        <Typography component="span" color="error" sx={{
                            textDecoration: "line-through",
                            fontWeight: theme.typography.fontWeightBold
                        }}>
                            Sale {Math.round(100 - ((product.price ?? 0) * 100 / (product.oldPrice ?? 1)))}%
                        </Typography>
                    </Typography>
                    <Typography variant="h6">
                        {"Покрытие: "}
                        <Typography component="span" variant="h6">
                            {product.surface.surfaceName}
                        </Typography>
                    </Typography>
                    <Typography variant="h6">
                        Описание модели: {product.description}
                    </Typography>

                    <Box sx={{
                        display: "flex",
                        marginBlock: 1,
                    }}>
                        {
                            product.modelItems.map((item, inx) => (
                                <Button size="small" name="size-btn"
                                    variant={selectedItem[inx] ? "contained" : "outlined"}
                                    sx={{ marginRight: 1 }}
                                    onClick={() => handlerClickSize(inx)}
                                >
                                    {`US ${item.size}`}
                                </Button>
                            ))
                        }
                        <input id="item-id-list" type="hidden" name="items_id_list" />
                    </Box>
                </Box>
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    width: "100%",
                }}>
                    <Box
                        sx={{
                            alignSelf: "center"
                        }}
                    >
                        <Box sx={{
                            display: "inline-block",
                            width: "100%"
                        }}>
                            <IconButton size="medium">
                                <Add />
                            </IconButton>
                            <Button variant="outlined" sx={{
                                textAlign: "center",
                                width: 100,
                            }}
                                size="small"
                            >
                                {0}
                            </Button>
                            <IconButton size="medium">
                                <Add />
                            </IconButton>
                        </Box>

                    </Box>
                    <Button variant="contained"
                        color="secondary"
                        disabled={!addBtnEnable}
                        sx={{
                            width: "max-content",
                            marginBlock: 2,
                            alignSelf: "center"
                        }}
                        endIcon={<ShoppingBasketOutlined />}
                        type="submit"
                    >
                        Добавить
                    </Button>
                </Box>
            </fetcher.Form>
        </Paper>
    )
}