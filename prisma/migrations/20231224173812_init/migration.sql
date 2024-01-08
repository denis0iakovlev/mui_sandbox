-- CreateTable
CREATE TABLE "Brand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brandName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryName" TEXT NOT NULL,
    "brandId" INTEGER NOT NULL,
    CONSTRAINT "ProductCategory_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "modelImg" TEXT NOT NULL,
    CONSTRAINT "ProductModel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "oldPrice" REAL NOT NULL,
    "images" TEXT NOT NULL,
    CONSTRAINT "Item_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ProductModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_brandName_key" ON "Brand"("brandName");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_categoryName_key" ON "ProductCategory"("categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "ProductModel_name_key" ON "ProductModel"("name");
