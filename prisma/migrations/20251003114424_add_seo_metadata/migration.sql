-- CreateTable
CREATE TABLE "seo_metadata" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'sk',
    "metaTitle" VARCHAR(60) NOT NULL,
    "metaDescription" VARCHAR(160) NOT NULL,
    "metaKeywords" TEXT[],
    "ogTitle" VARCHAR(60),
    "ogDescription" VARCHAR(160),
    "ogImage" TEXT,
    "ogType" TEXT NOT NULL DEFAULT 'website',
    "twitterCard" TEXT NOT NULL DEFAULT 'summary_large_image',
    "twitterTitle" VARCHAR(60),
    "twitterDescription" VARCHAR(160),
    "twitterImage" TEXT,
    "canonicalUrl" TEXT,
    "alternateUrls" JSONB,
    "jsonLd" JSONB,
    "h1Heading" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "apartments" ADD COLUMN "seoTitle" VARCHAR(60),
ADD COLUMN "seoDescription" VARCHAR(160),
ADD COLUMN "seoKeywords" TEXT[],
ADD COLUMN "ogImage" TEXT;

-- CreateIndex
CREATE INDEX "seo_metadata_pageSlug_idx" ON "seo_metadata"("pageSlug");

-- CreateIndex
CREATE INDEX "seo_metadata_locale_idx" ON "seo_metadata"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "seo_metadata_pageSlug_locale_key" ON "seo_metadata"("pageSlug", "locale");

