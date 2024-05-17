import {  useMediaQuery, useTheme } from "@mui/material";
import type {  MetaFunction } from "@remix-run/node";
import {  json, useLoaderData } from "@remix-run/react";
import { Unstable_Grid2 as Grid } from "@mui/material"
import { db } from "~/utils/db.serves";
import { SmallCard } from "~/components/SmallCard";
import { GridItem } from "~/components/GridItem";

export const meta: MetaFunction = () => {
  return [
    { title: "Goods for tennis" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async () => {
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
  return (
    <>
      {
        products.map((product) => (
          <Grid xs={6} sm={6} md={4} lg={3} xl={2} >
            <GridItem elevation={12}>
              <SmallCard model={product} />
            </GridItem>
          </Grid>
        ))
      }
    </>
  )
}