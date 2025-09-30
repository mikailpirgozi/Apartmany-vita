-- Add missing columns to users table
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "companyVat" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "companyAddress" TEXT;

-- Add missing columns to bookings table
ALTER TABLE "public"."bookings" ADD COLUMN IF NOT EXISTS "needsInvoice" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."bookings" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "public"."bookings" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "public"."bookings" ADD COLUMN IF NOT EXISTS "companyVat" TEXT;
ALTER TABLE "public"."bookings" ADD COLUMN IF NOT EXISTS "companyAddress" TEXT;

