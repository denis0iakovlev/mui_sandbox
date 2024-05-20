import { ArrowForward, NavigateBefore, NavigateNext } from "@mui/icons-material";
import { Box, IconButton, Paper, useTheme } from "@mui/material";
import { Unstable_Grid2 as Grid } from "@mui/material"
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import ImagesViewSmall from "~/components/ImagesViewSmall";
import ItemCard from "~/components/ItemCard";
import { db } from "~/utils/db.serves";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.id, "id is wrong");
    const productModel = await db.productModel.findUnique({
        where: {
            id: +params.id
        },
        include: {
            modelItems: true,
            brend: true,
        }
    });
    return json({ productModel });
}
export default function MainPage() {
    const [hovOnImage, SetHovOnImage] = useState(false);
    const { productModel } = useLoaderData<typeof loader>();
    const images = productModel?.modelImg?.split(';').filter((val) => (val != ""));
    const handlerSideHovCursor = (position: "on" | "leave") => {
        switch (position) {
            case "on":
                SetHovOnImage(true);
                break;
            case "leave":
                SetHovOnImage(false);
                break;
        }
    }

    return (
        <Grid container spacing={2}>
            <Grid xs={12} xl={4} xlOffset={4}>
                {/* Image block */}
                <Paper sx={{
                    minHeight: 200,
                    height: 300,
                    position: "relative"
                }}>
                    <Box sx={{
                        border: "1px dashed  #602020",
                        height: "100%",
                        width: "10%",
                        position: "absolute"
                    }}
                    >
                        <Box sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignContent: "center",
                            height: "100%"
                        }}>
                            <IconButton>
                                <NavigateBefore />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box sx={{
                        border: "1px dashed  #602020",
                        height: "100%",
                        width: "10%",
                        position: "absolute",
                        right: 0,
                    }}
                        onMouseEnter={() => handlerSideHovCursor("on")}
                        onMouseLeave={() => handlerSideHovCursor("leave")}
                    >
                        <Box sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignContent: "center",
                            height: "100%",
                            zIndex:100000
                        }}>
                            {/*<IconButton>
                                <NavigateNext />
                    </IconButton>*/}
                        </Box>
                    </Box>
                    {
                        hovOnImage ?
                            <Box sx={{
                                border: "1px solid  #52349d",
                                height: "100%",
                                width: "100%",
                                position: "absolute",
                                backgroundColor: "black",
                                opacity: 0.1,
                                zIndex:1
                            }}>

                            </Box> : null
                    }
                    <img src={images[0]} className="img-card" />
                </Paper>
            </Grid>
            {/** description block */}
            <Grid>

            </Grid>
        </Grid>
    )
}