import { TableBodyClassKey } from "@mui/material";
import { Brand, Item, ProductCategory, ProductModel, Sex, TableOfSizes, Surface } from "@prisma/client/edge";
import { db } from "~/utils/db.serves"
/**
 * Its function and types used admin page 
 */
export interface BrandData extends Brand {
    categoriesName: string
}
export interface Categories extends ProductCategory {
    relatedBrands: string;
}
export interface ProductModelData extends ProductModel {
    categoryName?: string;
    brendName?: string;
    items?: string;
}
//
export type TablesTypes = "brands" | "categories" | "models" | "item" | "sex" | "tableOfSize" | "surface";
//
export type UnionOfTables = Brand | ProductCategory | ProductModel | Item | Sex | TableOfSizes | Surface;
/**
 * 
 * @returns возвращает все бренды с отношением к категории товаров
 */
export async function getBrandList(): Promise<BrandData[]> {
    const brands = await db.brand.findMany({
        include: {
            categories: true
        }
    });
    let brandData: BrandData[] = [];
    for (let brand of brands) {
        let add: BrandData = {
            ...brand,
            categoriesName: Array.from(brand.categories, (category) => category.categoryName).join(';')
        }
        brandData.push(add);
    }
    return brandData;
}
/*
         Получить все категории товаров
*/
export async function getAllCategories(): Promise<Categories[]> {
    const categoryList = await db.productCategory.findMany({ include: { brands: true } });
    let result: Categories[] = [];
    for (let cat of categoryList) {
        let add: Categories = {
            ...cat,
            relatedBrands: Array.from(cat.brands, (brand) => brand.brandName).join(';')
        }
        result.push(add);
    }
    return result;
}
/*
         Получить все прдставленные модели товаров 
*/
export async function getAllProductModels(): Promise<ProductModelData[]> {
    const dbRecords = await db.productModel.findMany({ include: { category: true, brend: true, modelItems: true , surface:true} });
    let result: ProductModelData[] = [];
    for (let record of dbRecords) {
        let add: ProductModelData = {
            ...record,
            categoryName: record.category?.categoryName,
            brendName: record.brend?.brandName,
            items: Array.from(record.modelItems, (item) => (item.id)).join(','),
        }
        result.push(add);
    }

    return result;
}
/*
Получитьвсе позиции товаров
 */
export async function getAllItems() {
    const dbItems = await db.item.findMany({ include: { productModel: true, sex: true } });
    return dbItems;
}
//For action of create new empty record in db 
export async function createEmptyDbRecord(typeTable: TablesTypes): Promise<UnionOfTables> {
    switch (typeTable) {
        case "brands":
            return await db.brand.create({ data: { brandName: "новый бренд" } });
        case "categories":
            return await db.productCategory.create({ data: { categoryName: "новая категория" } });
        case "models":
            return await db.productModel.create({ data: { description: "описание", name: "Имя продукта" } })
        case "item":
            return await db.item.create({});
        case "sex":
            return await db.sex.create({});
        case "tableOfSize":
            return await db.tableOfSizes.create({});
        case "surface":
            return await db.surface.create({data:{surfaceName:""}});
        default:
            throw Error("Not implemented for " + typeTable + " type table");
    }
}
/*
Its composed function for delete the record certain table of db
 */
export async function deleteRecordOnId(typeTable: TablesTypes, id: number): Promise<void> {
    let useDb = null;
    switch (typeTable) {
        case "brands":
            await db.brand.delete({ where: { id: id } });
            break;
        case "categories":
            await db.productCategory.delete({ where: { id: id } });
            break;
        case "models":
            await db.productModel.delete({ where: { id: id } });
            break;
        case "item":
            await db.item.delete({ where: { id: id } });
            break;
        case "sex":
            await db.sex.delete({ where: { id: id } });
            break;
        case "tableOfSize":
            await db.tableOfSizes.delete({ where: { id: id } });
            break;
        case "surface":
            await db.tableOfSizes.delete({ where: { id: id } });
            break;
    }
}
/**
 * 
 * @param typeTable 
 * @param sourceId 
 */
export async function getRecord(typeTable: TablesTypes, id: number): Promise<UnionOfTables> {
    let res: UnionOfTables | null;
    const whereData = { where: { id: id } };
    switch (typeTable) {
        case "brands":
            res = await db.brand.findUnique(whereData);
            break;
        case "categories":
            res = await db.productCategory.findUnique(whereData);
            break;
        case "models":
            res = await db.productModel.findUnique(whereData);
            break;
        case "item":
            res = await db.item.findUnique(whereData);
            break;
        case "sex":
            res = await db.sex.findUnique(whereData);
            break;
        case "tableOfSize":
            res = await db.tableOfSizes.findUnique(whereData);
            break;
        case "surface":
            res = await db.surface.findUnique(whereData);
            break;
    }
    if (!res) {
        throw Error(`id ${id} not valid for table ${typeTable}`);
    }
    return res;
}
/*
Create new record and copy data from source
*/
export async function createAndCopyFrom(typeTable: TablesTypes, sourceId: number): Promise<number> {
    const sourceRecord = await getRecord(typeTable, sourceId);
    //
    let newRecord :any = null;
    switch (typeTable) {
        case "brands":
            const srcRec = sourceRecord as Brand;
            const { id: _, ...src } = srcRec;
            console.log(src);
            newRecord = await db.brand.create({
                data: {
                    ...src
                }
            });
            break;
        case "item":
            const srcItem = sourceRecord as Item;
            const { ...data }: Partial<Omit<Item, "id" >> = srcItem;
            delete data["id"];
            newRecord = await db.item.create({
                data
            });
        default:
            throw Error("Its table not support copy from button");
    }
    return newRecord.id;
}
