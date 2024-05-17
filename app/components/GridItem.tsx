import { styled, Paper, PaperProps } from "@mui/material";

export const GridItem = styled(Paper)<PaperProps>(({ theme }) => (
    {
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        color: theme.palette.text.secondary,
        height: 200,
        maxWidth: 300,
        margin: "0 auto",
        elevation: 12,
        boxShadow: theme.shadows[6],
        overflow: "hidden"
    }));
