import { Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect, useLoaderData, useSearchParams } from "@remix-run/react";
import { Unstable_Grid2 as Grid, styled, Paper, PaperProps } from "@mui/material"
import { db } from "~/utils/db.serves";
import { SmallCard } from "~/components/SmallCard";
import { checkLogin } from "~/utils/session";

export const meta: MetaFunction = () => {
  return [
    { title: "Goods for tennis" },
    { name: "description", content: "Welcome to tennis store!" },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const products = await db.productModel.findMany({
    include: {
      brend: true,
      sex: true,
      surface: true,
      modelItems: true,
    }
  });
  return json({ products });
}

export default function Index() {
  const { products } = useLoaderData<typeof loader>();
  const [searchParams, SetSearchParams] = useSearchParams();
  return (
    <>
      <Grid container spacing={2}>
        {
          products.map((product) => (
            <Grid xs={6} sm={6} md={4} lg={3} xl={2} >
              <GridItem elevation={12}>
                <SmallCard model={product} />
              </GridItem>
            </Grid>
          ))
        }
      </Grid>
    </>
  )
}

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