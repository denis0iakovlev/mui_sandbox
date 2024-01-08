/*
  Warnings:

  - You are about to drop the column `brandId` on the `ProductCategory` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_BrandToProductCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BrandToProductCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BrandToProductCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryName" TEXT NOT NULL
);
INSERT INTO "new_ProductCategory" ("categoryName", "id") SELECT "categoryName", "id" FROM "ProductCategory";
DROP TABLE "ProductCategory";
ALTER TABLE "new_ProductCategory" RENAME TO "ProductCategory";
CREATE UNIQUE INDEX "ProductCategory_categoryName_key" ON "ProductCategory"("categoryName");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_BrandToProductCategory_AB_unique" ON "_BrandToProductCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_BrandToProductCategory_B_index" ON "_BrandToProductCategory"("B");
