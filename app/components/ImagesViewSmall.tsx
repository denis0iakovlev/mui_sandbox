import { Box } from "@mui/material";
import { useState } from "react";

export default function ImagesViewSmall({imgList}:{imgList:string[]}) {
    const [imgIndex, SetImgIndex] = useState<number>(0);
    const [isFocus, SetIsFocus] = useState<boolean[]>(Array(imgList.length).fill(false));
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
                    Array(imgList.length).fill(0).map((num, index) => (
                        <Box sx={{
                            width: `calc(100% / ${imgList.length})`,
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
            <Box sx={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    zIndex: 0,
                }}>
                    <img src={imgList[imgIndex]} alt="" className="img-card" />
                </Box>
        </Box>
    )
}