import { Box, BoxProps, Button, Paper, PaperProps, TextField, Typography, styled, useMediaQuery, useTheme, useThemeProps } from "@mui/material";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, json, useLoaderData } from "@remix-run/react";
import { Unstable_Grid2 as Grid } from "@mui/material"
import adminImg3 from "public/assets/admin3.png";
import { db } from "~/utils/db.serves";
import { SmallCard } from "~/components/SmallCard";

export const meta: MetaFunction = () => {
  return [
    { title: "Goods for tennis" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async () => {
  const products = await db.productModel.findMany({include:{
    brend:true, 
    sex:true,
    surface:true,
    modelItems:true, 
  }});
  return json({ products });
}

export default function Index() {
  const theme = useTheme();
  const { products } = useLoaderData<typeof loader>();
  const isLessThanSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isLessThanLg = useMediaQuery(theme.breakpoints.down('lg'));
  const szItem = isLessThanSm ? 6 : isLessThanLg ? 3 : 2;
  return (
    <Grid container spacing={2} sx={{ 
      p: 2,
      }}>
      {
        products.map((product) => (
          <Grid xs={szItem}>
            <Item elevation={12}>
             <SmallCard model={product}/>
            </Item>
          </Grid>
        ))
      }
    </Grid>
  )
}

const Item = styled(Paper)<PaperProps>(({ theme }) => (
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
  }));
