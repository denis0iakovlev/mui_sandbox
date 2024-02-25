import { Box, Typography } from "@mui/material"
import { relative } from "path";
import noFotoImage from "public/assets/no_image.jpg"

export default function RibbomImages({ inx, images }: { inx: number, images: string[] }) {
    if(images.length === 0){
        images = [];
        images.push(noFotoImage);
    }
    const onMouseHandler = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
        const imageList: HTMLImageElement = document.getElementById(`image-list-id-${inx}`) as HTMLImageElement;
        if (imageList) {
            imageList.src = images[index];
        }
    }
    const omMouseOut = () => {
        const imageList: HTMLImageElement = document.getElementById(`image-list-id-${inx}`) as HTMLImageElement;
        if (imageList) {
            imageList.src = images[0];
        }
    }
    return (
        <Box width={300} height={400} className="image-list">
            <img id={`image-list-id-${inx}`} src={images[0]} alt="tennis shoes" />
            {
                images.map((i, index) => (
                    <Box
                        component="div"
                        key={index}
                        onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => onMouseHandler(index, e)}
                        onMouseOut={omMouseOut}
                        sx={{ p: `${300 / (images.length * 2)}px`, position: "relative", left: "-300px", zIndex: 1 }} />
                ))
            }
        </Box>
    )

}