import { Add } from "@mui/icons-material";
import { Box, Button, ButtonGroup, IconButton, styled } from "@mui/material";
import { NodeOnDiskFile } from "@remix-run/node";
import React, { useState } from "react";
import Image from "public/images/modelItem/1/img_file_2.jpg";

export function ImageList({ images }: { images: string[] }) {
    const nullArr = Array(5 - images.length).fill(null);
    const [imageList, SetImageList] = useState<string[]>(images.concat(nullArr));
    const changeImageHandler = (inx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const copyImageList = imageList.slice();
        if (e.target.files) {
            const urlImage = URL.createObjectURL(e.target.files[0]);
            copyImageList[inx] = urlImage;
            SetImageList(copyImageList);
        }
    }
    return (
        <ButtonGroup>
            {
                imageList.map((imag, index) => (
                    <ImageIconButton image={imag} num={index} handler={
                        (e: React.ChangeEvent<HTMLInputElement>) => changeImageHandler(index, e)
                    } />
                ))
            }
        </ButtonGroup>
    )
}

function ImageIconButton({ image, num, handler }: { image?: string | null, num: number, handler?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <IconButton sx={{
            border: "1px solid black",
            borderRadius: 3,
            mx:1,
        }}
            size="medium"
            component="label"
        >
            <Box component="div"sx={{ width: 50, height: 50 }}>
                {

                    image ? <img src={image} className=".img" onLoad={(e) => { URL.revokeObjectURL(e.target.src) }}></img>
                        : <Add sx={{height:50, width:20}} />
                }
                <VisualllyHiddenInput type="file" name={`img_file_${num}`} onChange={handler} />
            </Box>
        </IconButton>
    )
}

const VisualllyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});