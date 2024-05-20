import { Box, Button, Divider, Typography } from "@mui/material";
import { Brand, Item, ProductModel, Sex, Surface } from "@prisma/client";
import { Link } from "@remix-run/react";
import { relative } from "path";
import { useState } from "react";
import ImagesViewSmall from "./ImagesViewSmall";

interface SmallCardArgs {
    model: ProductModel & { brend: Brand, modelItems: Item[], surface: Surface },
    isShow?: boolean,
}
export function SmallCard(opt: SmallCardArgs) {
    const imageList = opt.model.modelImg?.split(';');
    const imageList2 = imageList?.filter((val) => (val != ""));
    return (
        <>
            {/*div for show image*/}
            <ImagesViewSmall imgList={imageList2}/>
            <Divider />
            {/** Description , sizes, name  */}
            <Link to={`${opt.model.id}`}>
                <Box sx={{
                    width: "100%",
                    height: "50%",
                }}>
                    <Typography variant="body2">
                        {`${opt.model.brend.brandName} ${opt.model.name}`}
                    </Typography>
                    <Box>
                        <Typography variant="body2">
                            Размеры в US:{
                                opt.model.modelItems.map((item, index) => (
                                    <Typography component="span">
                                        {item.size}
                                        {index !== opt.model.modelItems.length - 1 ? ", " : null}
                                    </Typography>
                                ))
                            }
                        </Typography>
                        <Typography variant="body2">
                            Цена: <Typography variant="body2" component="span">
                                {` ${opt.model.oldPrice}`}
                            </Typography>
                            <Typography variant="body2" component="span">
                                {` ${opt.model.price}`}
                            </Typography>
                        </Typography>
                        <Typography variant="body2">
                            Покрытие: {opt.model.surface.surfaceName}
                        </Typography>
                    </Box>
                </Box>
            </Link>
        </>
    )
}