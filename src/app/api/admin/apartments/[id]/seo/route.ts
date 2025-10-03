/**
 * Admin API: Apartment SEO Management
 * PUT /api/admin/apartments/[id]/seo - Update apartment SEO fields
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateApartmentSeo } from "@/services/seo";
import { z } from "zod";

// Validation schema
const ApartmentSeoSchema = z.object({
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string()).optional(),
  ogImage: z.string().url().optional(),
});

/**
 * PUT /api/admin/apartments/[id]/seo
 * Update apartment SEO fields
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = ApartmentSeoSchema.parse(body);

    const apartment = await updateApartmentSeo(id, validated);

    return NextResponse.json({
      success: true,
      data: apartment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[API] Error updating apartment SEO:", error);
    return NextResponse.json(
      { error: "Failed to update apartment SEO" },
      { status: 500 }
    );
  }
}

