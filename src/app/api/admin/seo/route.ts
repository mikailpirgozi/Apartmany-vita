/**
 * Admin API: SEO Metadata Management
 * GET /api/admin/seo - List all SEO metadata
 * POST /api/admin/seo - Create/update SEO metadata
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllSeoMetadata,
  upsertSeoMetadata,
} from "@/services/seo";
import { z } from "zod";

// Validation schema
const SeoMetadataSchema = z.object({
  pageSlug: z.string().min(1),
  locale: z.string().default("sk"),
  metaTitle: z.string().max(60),
  metaDescription: z.string().max(160),
  metaKeywords: z.array(z.string()),
  ogTitle: z.string().max(60).optional(),
  ogDescription: z.string().max(160).optional(),
  ogImage: z.string().url().optional(),
  ogType: z.string().default("website"),
  twitterCard: z.string().default("summary_large_image"),
  twitterTitle: z.string().max(60).optional(),
  twitterDescription: z.string().max(160).optional(),
  twitterImage: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  alternateUrls: z.record(z.string()).optional(),
  jsonLd: z.record(z.unknown()).optional(),
  h1Heading: z.string().max(100).optional(),
});

/**
 * GET /api/admin/seo
 * List all SEO metadata entries
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const seoMetadata = await getAllSeoMetadata();

    return NextResponse.json({
      success: true,
      data: seoMetadata,
    });
  } catch (error) {
    console.error("[API] Error fetching SEO metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch SEO metadata" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/seo
 * Create or update SEO metadata
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = SeoMetadataSchema.parse(body);

    const seoMetadata = await upsertSeoMetadata(
      validated.pageSlug,
      validated.locale,
      validated
    );

    return NextResponse.json({
      success: true,
      data: seoMetadata,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] Error upserting SEO metadata:", error);
    return NextResponse.json(
      { error: "Failed to save SEO metadata" },
      { status: 500 }
    );
  }
}

