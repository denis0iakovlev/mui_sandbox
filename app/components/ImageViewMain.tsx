import { Paper, SxProps, Box, IconButton } from "@mui/material"
import { useState } from "react";
import { Crop169, NavigateBefore, NavigateNext } from "@mui/icons-material";

function IconContainer({ mainProps, showIcon, onMouseEnter, onMouseLeave, onClick, icon }: {
    mainProps: SxProps,
    showIcon: boolean, onMouseEnter: () => void, onMouseLeave: () => void, onClick: () => void, icon: React.ReactNode
}) {
    const props: SxProps = showIcon ? {
        display: "flex",
        justifyContent: "center",
        height: "100%",
        backgroundColor:"rgb(0,0,0,0.1)"
    } : {
        display: "flex",
                justifyContent: "center",
                height: "100%",
    }
    return (
        <Box sx={mainProps}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <Box sx={props}>
                <IconButton sx={{ alignSelf: "center" }}
                    onClick={onClick}
                >
                    {
                        showIcon ? <>{icon}</> : null
                    }
                </IconButton>
            </Box>
        </Box>
    )
}
export default function ImageViewMain({images}:{images:string[]})
{
    const [hovOnImage, SetHovOnImage] = useState(false);
    const [inxImg, SetInxImg] = useState(0);//Set current image
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
    const handleClickBtn = (direction: "back" | "forward") => {
        switch (direction) {
            case "back":
                if (inxImg > 0) SetInxImg(prev => prev - 1);
                break;
            case "forward":
                if (images) {
                    if (inxImg < images.length - 1) SetInxImg(prev => prev + 1)
                }
                break;
        }
    }
    const handleClickBelow = (num:number)=>{
        SetInxImg(num);
    }
    return(
        <Paper sx={{
            minHeight: 200,
            height: "100%",
            position: "relative"
        }}>
            <IconContainer mainProps={{
                position: "absolute",
                width: "10%",
                height: "100%",
                zIndex: 100000,
            }}
                showIcon={hovOnImage}
                onMouseEnter={() => handlerSideHovCursor("on")}
                onMouseLeave={() => handlerSideHovCursor("leave")}
                onClick={() => handleClickBtn("back")}
                icon={<NavigateBefore />}
            />
            <IconContainer mainProps={{
                position: "absolute",
                width: "10%",
                height: "100%",
                right: 0,
                zIndex: 100000
            }}
                showIcon={hovOnImage}
                onMouseEnter={() => handlerSideHovCursor("on")}
                onMouseLeave={() => handlerSideHovCursor("leave")}
                onClick={() => handleClickBtn("forward")}
                icon={<NavigateNext />}
            />
            <img src={images[inxImg]} className="img-card" />
            <Box 
                sx={{
                    position:"absolute",
                    bottom:0,
                    width:"100%"
                }}
            >
                {/* container for button*/}
                <Box sx={{
                  margin:"0 auto",
                  display:"flex",
                  justifyContent:"center"  
                }}>
                    {
                        Array(images.length).fill(0).map((num, index)=>(
                            <IconButton onClick={()=>handleClickBelow(index)}>
                                <Crop169 fontSize="small" color={inxImg === index ? "info": "inherit"} />
                            </IconButton>
                        ))
                    }
                </Box>
            </Box>
        </Paper>
    )
}