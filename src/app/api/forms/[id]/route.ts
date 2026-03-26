import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const form = await prisma.signedForm.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: "טופס לא נמצא" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "true";

    if (download) {
      const filePath = path.join(process.cwd(), form.pdfPath);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "קובץ PDF לא נמצא" }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(filePath);
      const filename = path.basename(form.pdfPath);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Form fetch error:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת הטופס" },
      { status: 500 }
    );
  }
}
