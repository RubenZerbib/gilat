import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/validation";
import { generateSignedPdf } from "@/lib/pdf-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = formSchema.parse(body);

    const pdfPath = await generateSignedPdf(validated);

    const record = await prisma.signedForm.create({
      data: {
        fullName: validated.fullName,
        idNumber: validated.idNumber,
        answers: JSON.stringify({
          medicalAnswers: validated.medicalAnswers,
          medications: validated.medications,
          allergies: validated.allergies,
          additionalNotes: validated.additionalNotes,
        }),
        pdfPath,
      },
    });

    return NextResponse.json({ success: true, id: record.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, errors: (error as unknown as { errors: unknown[] }).errors },
        { status: 400 }
      );
    }
    console.error("Form submission error:", error);
    return NextResponse.json(
      { success: false, error: "שגיאה בשליחת הטופס" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const where = search
      ? {
          OR: [
            { fullName: { contains: search } },
            { idNumber: { contains: search } },
          ],
        }
      : {};

    const [forms, total] = await Promise.all([
      prisma.signedForm.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.signedForm.count({ where }),
    ]);

    return NextResponse.json({
      forms,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Forms fetch error:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת הטפסים" },
      { status: 500 }
    );
  }
}
