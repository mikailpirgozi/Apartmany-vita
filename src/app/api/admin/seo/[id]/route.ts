/**
 * Admin API: SEO Metadata Management (single item)
 * DELETE /api/admin/seo/[id] - Delete SEO metadata
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteSeoMetadata } from "@/services/seo";

/**
 * DELETE /api/admin/seo/[id]
 * Delete SEO metadata by ID
 */
export async function DELETE(
  _request: NextRequest,
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

    await deleteSeoMetadata(id);

    return NextResponse.json({
      success: true,
      message: "SEO metadata deleted successfully",
    });
  } catch (error) {
    console.error("[API] Error deleting SEO metadata:", error);
    return NextResponse.json(
      { error: "Failed to delete SEO metadata" },
      { status: 500 }
    );
  }
}

