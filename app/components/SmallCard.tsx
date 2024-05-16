import { Box, Button, Divider, Typography } from "@mui/material";
import { Brand, Item, ProductModel, Sex, Surface } from "@prisma/client";
import { Link } from "@remix-run/react";
import { relative } from "path";
import { useState } from "react";

interface SmallCardArgs {
    model: ProductModel & { brend: Brand, modelItems: Item[], surface: Surface },
    isShow?: boolean,
}
export function SmallCard(opt: SmallCardArgs) {
    const [imgIndex, SetImgIndex] = useState<number>(0);
    const imageList = opt.model.modelImg?.split(';');
    const imageList2 = imageList?.filter((val) => (val != ""));
    const [isFocus, SetIsFocus] = useState<boolean[]>(Array(imageList2?.length).fill(false));
    const handlerMouseEnter = (numImg: number) => {
        SetImgIndex(numImg);
        const change = isFocus;
        change.fill(false);
        change[numImg] = true;
        SetIsFocus(change);
    }
    const handlerMouseLeave = (numImg: number) => {
        const change = isFocus;
        change[numImg] = false;
        SetIsFocus(change);
    }
    return (
        <>
            {/*div for show image*/}
            <Box sx={{
                width: "100%",
                height: "50%",
                position: "relative"
            }}>
                {/* Split on section for change image */}
                <Box sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "flex",

                }}
                    onMouseLeave={() => { SetImgIndex(0); const change = isFocus; change[0] = true; SetIsFocus(change); }}
                >
                    {
                        Array(imageList2?.length).fill(0).map((num, index) => (
                            <Box sx={{
                                width: `calc(100% / ${imageList2?.length})`,
                                height: "100%",
                                opacity: isFocus[index] ? "0.5" : "1",
                                zIndex: 1
                            }}
                                onMouseEnter={() => handlerMouseEnter(index)}
                                onMouseLeave={() => handlerMouseLeave(index)}
                            >
                            </Box>
                        ))
                    }
                </Box>
                {/** Foto switcher */}
                <Box sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    zIndex: 0,
                }}>
                    <img src={imageList2[imgIndex]} alt="" className="img-small-card" />
                </Box>

            </Box>
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