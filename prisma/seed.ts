import { Brand, PrismaClient } from "@prisma/client"
import { connect } from "http2";

const db = new PrismaClient();

async function main() {
    const brands = getBrands();
}

main().then(async () => {
    await db.$disconnect()
}).catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
});

function getBrands() {
    return [
        {
            brandName: "Nike"
        },
        {
            brandName: "Adidas"
        },
        {
            brandName: "Wilson"
        },
        {
            brandName: "Babolat"
        },
    ]
}
function getCategories() {
    return [
        {
            categoryName: "Обувь",

        }, {
            categoryName: "Одежда"
        }
    ]
}