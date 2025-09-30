-- Emergency hotfix: Add missing columns to users and bookings tables
-- Run this directly in Railway Postgres Query tab

-- Add columns to users table
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "companyVat" TEXT;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "companyAddress" TEXT;

-- Add columns to bookings table
ALTER TABLE "public"."bookings" ADD COLUMN IF NOT EXISTS "needsInvoice" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."bookings" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "public"."bookings" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "public"."bookings" ADD COLUMN IF NOT EXISTS "companyVat" TEXT;
ALTER TABLE "public"."bookings" ADD COLUMN IF NOT EXISTS "companyAddress" TEXT;

-- Verify columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

