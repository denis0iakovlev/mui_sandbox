import { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant"
import { db } from "~/utils/db.serves";
import NoImage from "public/assets/no_image.jpg"
import React, { useState } from "react";
import { Box, BoxProps, Button, FormControl, FormControlLabel, IconButton, Paper, Radio, RadioGroup, Stack, ThemeProvider, Typography, createTheme, styled } from "@mui/material";
import { NavigateNext, NavigateBefore, CheckBox } from "@mui/icons-material";
import { Item } from "@prisma/client";
import { useTheme } from "@emotion/react";
import {deepmerge} from "@mui/utils"

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.modelId, "Missing model id");
    const model = await db.productModel.findUnique({
        where: {
            id: +params.modelId,
        },
        include: {
            brend: true,
            category: true,
            modelItems: true,
            surface: true,
        }
    });
    if (model == null || model == undefined) {
        throw `Not found model on id ${params.modelId}`;
    }
    return json({ model });
}

const theme = createTheme( {
        components: {
            MuiPaper: {
                defaultProps: {
                    elevation: 1,
                },
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        marginTop: 4,
                    }
                }
            },
            MuiTypography: {
                defaultProps: {
                    variant: "body1",
                    p: 0.5,
                }
            },
            MuiFormControlLabel: {
                styleOverrides: {
                    root: {
                        marginRight: -16,
                        marginLeft: 0,
                    }
                }
            },
        }
    }
);

export default function ModelCardMain() {
    const { model } = useLoaderData<typeof loader>();
    //Select num Size 
    const [selectSize, SetSelectSize] = useState<number>(-1);
    //
    const handlerSelextSize = (inxSize: number) => {
        if (selectSize === inxSize) {
            SetSelectSize(-1);
        } else {
            SetSelectSize(inxSize);
        }
    }
    const modelImages: string[] = [];
    if (model.modelImg) {
        const images = model.modelImg.split(';');
        for (const img of images) {
            if (img.length > 2) {
                modelImages.push(img);
            }
        }
    }
    const outerTheme = useTheme();
    const commomTheme = deepmerge(theme, outerTheme);
    //delete duplicate
    return (
        <ThemeProvider theme={commomTheme}>
            <Box sx={{
                margin: "0 auto",
                width: "20em"
            }}>
                <Box>
                    <Paper
                        elevation={24}
                        component="div"
                        sx={{
                            margin: "0 auto",
                            p: 1,
                        }}>
                        {
                            modelImages ? ImageWithNextButton(modelImages)
                                : <img src={NoImage} alt="Нет фото" />
                        }
                    </Paper>
                    <Paper >
                        <Typography variant="h6">
                            {`${model.brend?.brandName} ${model.name}`}
                        </Typography>
                        <Typography >
                            Размеры: {
                                PrepareSizes(model.modelItems).map((sz, inx) => (<Button
                                    sx={{ p: 0 }}
                                    variant={inx === selectSize ? "contained" : "outlined"}
                                    onClick={() => handlerSelextSize(inx)}
                                >US {sz}</Button>))
                            }
                        </Typography>
                        <Typography variant="h6">
                            Цена: <span className="old-price-text">{model.oldPrice}</span>{` ${model.price}`}
                        </Typography>
                        <Typography >
                            Описание:<br />
                            {model.description}
                        </Typography>
                    </Paper>
                    <Paper sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-end",
                    }}>
                        <Button sx={{ flex: "1" }} variant="contained" disabled={selectSize === -1}>
                            В корзину
                        </Button>
                    </Paper>
                </Box>
            </Box>
        </ThemeProvider>
    )
}

function ImageWithNextButton(images: string[]) {
    const [numImage, SetNumImage] = useState<number>(0);
    //show next button
    const [isShowNextImage, SetShowNextImage] = useState<boolean>(false);
    //user hover on image element
    const onMouseOverHandler = () => {
        if (!isShowNextImage) {
            SetShowNextImage(true);
        }
    }
    //mouse is not placed over image 
    const onMouseOutHandler = () => {
        SetShowNextImage(false);
    }
    //Next or prev press handling
    const clickNextHandler = (typeMove: "next" | "prev") => {
        console.log("num image " + numImage);
        if (typeMove === "next" && numImage < images.length - 1) {
            SetNumImage((prev) => (prev + 1));
        } else if (typeMove === "prev" && numImage > 0) {
            SetNumImage((prev) => (prev - 1));
        }
    }
    const clickRadioButtonClick = (num: number) => {
        SetNumImage(num);
    }
    return (
        <>
            <Stack direction="row" sx={{
                height: '20em',
                position: "relative",
                backgroundColor: "#eeeeee"
            }}>
                <OverBox
                    onMouseOut={onMouseOutHandler}
                    onMouseOver={onMouseOverHandler}
                    onClick={() => clickNextHandler("prev")}
                />
                {
                    isShowNextImage ? (
                        <IconButton onMouseOver={onMouseOverHandler} sx={{ position: "absolute", alignSelf: "center", }}>
                            <NavigateBefore />
                        </IconButton>
                    ) : null
                }
                <img
                    src={images[numImage]}
                    className="image-main-card"
                    alt="show foto"
                />
                <OverBox
                    sx={{ right: 0, }}
                    onMouseOut={onMouseOutHandler}
                    onMouseOver={onMouseOverHandler}
                    onClick={() => clickNextHandler("next")}
                />
                {
                    isShowNextImage ? (

                        <IconButton sx={{ position: "absolute", right: 0, alignSelf: "center", zIndex: 1 }}>
                            <NavigateNext />
                        </IconButton>
                    ) : null
                }
            </Stack>
            <Box sx={{ margin: "0 auto" }}>
                <FormControl sx={{ display: "block" }}>
                    <RadioGroup row sx={{ margin: "0 auto", justifyContent: "center" }}>
                        {
                            Array(images.length).fill(0).map((some, inx) => (
                                <FormControlLabel control={<Radio size="sm" />} label="" checked={inx === numImage}
                                    onClick={() => clickRadioButtonClick(inx)
                                    }

                                />
                            ))
                        }
                    </RadioGroup>
                </FormControl>
            </Box>
        </>
    )
}
const OverBox = styled(Box)<BoxProps>(({ theme }) => ({
    component: "div",
    position: "absolute",
    height: "100%",
    zIndex: 2,
    padding: "0 15% 0 15%"
}));

function PrepareSizes(items: Item[]): string[] {
    let res = "";
    //get all sizes 
    const sizes = items.map((i) => i.size);
    sizes.sort((left, right) => {
        if (!left) {
            return -1;
        } else if (!right) {
            return 1;
        }
        const l_val = + left;
        const r_val = +right;
        if (l_val < r_val) {
            return -1
        }
        if (l_val > r_val) {
            return 1;
        }
        return 0;
    });
    const notNull = sizes.filter((sz) => sz !== null);
    const unique = notNull.filter((sz, inx) => sizes.indexOf(sz) === inx);
    return unique;
}