-- CreateEnum
CREATE TYPE "BreakfastCategory" AS ENUM ('BREAD_AND_EGGS', 'SWEET', 'SAVORY', 'DRINKS', 'SNACKS');

-- CreateTable
CREATE TABLE "breakfasts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "weight" TEXT,
    "images" TEXT[],
    "category" "BreakfastCategory" NOT NULL,
    "allergens" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "guestPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breakfasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breakfast_orders" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 0,
    "children" INTEGER NOT NULL DEFAULT 0,
    "adultPrice" DECIMAL(10,2) NOT NULL,
    "childPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "delivery" BOOLEAN NOT NULL DEFAULT false,
    "specialRequests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breakfast_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "breakfasts_slug_key" ON "breakfasts"("slug");

-- CreateIndex
CREATE INDEX "breakfasts_category_idx" ON "breakfasts"("category");

-- CreateIndex
CREATE INDEX "breakfasts_isActive_idx" ON "breakfasts"("isActive");

-- CreateIndex
CREATE INDEX "breakfast_orders_bookingId_idx" ON "breakfast_orders"("bookingId");
