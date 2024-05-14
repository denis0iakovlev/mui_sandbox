import { Box, Stack, StackOwnProps, Typography } from "@mui/material"
import { relative } from "path";
import noFotoImage from "public/assets/no_image.jpg"

export default function RibbonImages({ inx, images, props }: {
    inx: number,
    images: string[],
    props?: StackOwnProps
}) {
    if (images.length === 0) {
        images = [];
        images.push(noFotoImage);
    }
    const onMouseHandler = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
        const imageList: HTMLImageElement = document.getElementById(`image-list-id-${inx}`) as HTMLImageElement;
        if (imageList) {
            imageList.src = images[index];
        }
    }
    const onMouseOut = () => {
        const imageList: HTMLImageElement = document.getElementById(`image-list-id-${inx}`) as HTMLImageElement;
        if (imageList) {
            imageList.src = images[0];
        }
    }
    return (
        <Stack direction="column" {...props}>
            <img
                className="image-main-card"
                id={`image-list-id-${inx}`}
                src={images[0]} alt="tennis shoes"
            />
            <Box sx={{ border: "1px dased red", p: 4 }}>
                <Typography variant="h6">
                    hello
                </Typography>
            </Box>
        </Stack>
    )
}
