import { ShoppingBasketOutlined } from "@mui/icons-material";
import { Paper, Typography, Box, Button, useTheme } from "@mui/material";
import { Brand, Item, ProductModel, Surface } from "@prisma/client";
import { useState } from "react";

export default function InfoMain({ product }: { product: ProductModel & { brend: Brand, surface: Surface, modelItems: Item[] } }) {
    const [selectedItem, SetSelectedItem] = useState<Item | null>(null);
    const theme = useTheme();
    const handlerClickSize = (inx: number) => {
        const selItem = product.modelItems[inx];
        if (selItem.id === selectedItem?.id) {
            SetSelectedItem(null);
        } else {
            SetSelectedItem(selItem);
        }
    }
    return (
        <Paper sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }}>
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
                            <Button size="small" variant={selectedItem?.id === item.id ? "contained" : "outlined"} sx={{ marginRight: 1 }}
                                onClick={() => handlerClickSize(inx)}
                            >
                                {`US ${item.size}`}
                            </Button>
                        ))
                    }
                </Box>
            </Box>
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                justifySelf: "end",
                alignSelf: "end"
            }}>
                <Button variant="contained"
                    color="secondary"
                    disabled={selectedItem === null} sx={{
                        width: "100%",
                        m: 2,
                        justifySelf: "center"
                    }}
                    endIcon={<ShoppingBasketOutlined />}
                >
                    Добавить
                </Button>
            </Box>
        </Paper>
    )
}