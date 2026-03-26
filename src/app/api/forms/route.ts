import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/validation";
import { generateSignedPdf } from "@/lib/pdf-generator";
import { ZodError } from "zod";

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
    console.error("Form submission error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      { success: false, error: message },
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
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
