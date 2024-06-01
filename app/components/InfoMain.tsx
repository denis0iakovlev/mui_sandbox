import { Add, ShoppingBasketOutlined } from "@mui/icons-material";
import { Paper, Typography, Box, Button, useTheme, IconButton, TextField } from "@mui/material";
import { Brand, Item, ProductModel, Surface } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";

export default function InfoMain({ product }: { product: ProductModel & 
    { brend: Brand, surface: Surface, modelItems: Item[] } }) {
    const [selectedItem, SetSelectedItem] = useState<Item[] >([]);
    const fetcher = useFetcher();
    const theme = useTheme();
    const handlerClickSize = (inx: number) => {
        const selItem = product.modelItems[inx];
        const inxFromSel = selectedItem.findIndex(item=>item.id === selItem.id);
        const copy = selectedItem;
        if (inxFromSel >= 0) {
            console.log(`Remove index ${inxFromSel} ${selItem.id} size:${selectedItem.length}`);
            copy.splice(inxFromSel, 1);
            console.log(copy);
        } else {
            console.log(`Add ${selItem.id} size:${selectedItem.length}`);
            copy.push(selItem);
        }
        SetSelectedItem(copy);
        const element = document.getElementById("item-id-list") as HTMLInputElement;
        if(element){
            Array.from(copy, (item)=> item.id).join();
            element.value = Array.from(copy, (item)=> item.id).join();
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
                                <Button size="small"  name="size-btn" 
                                variant={selectedItem.length !== 0 ? "contained" : "outlined"} 
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
                        disabled={selectedItem === null} sx={{
                            width: "80%",
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