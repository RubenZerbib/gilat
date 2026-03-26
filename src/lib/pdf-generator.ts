import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import * as fs from "fs";
import * as path from "path";
import { PDF_FIELD_MAPPING, MEDICAL_QUESTIONS, type SignaturePosition } from "@/config/pdf-mapping";
import type { FormData } from "@/lib/validation";

function formatDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9\u0590-\u05FF_-]/g, "_").substring(0, 50);
}

function decodeBase64Png(dataUrl: string): Buffer {
  const commaIndex = dataUrl.indexOf(",");
  const raw = commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl;
  return Buffer.from(raw, "base64");
}

async function loadHebrewFont(pdfDoc: PDFDocument) {
  pdfDoc.registerFontkit(fontkit);

  const fontPath = path.join(process.cwd(), "public", "fonts", "Heebo-Regular.ttf");
  if (!fs.existsSync(fontPath)) {
    throw new Error(
      `Hebrew font not found at ${fontPath}. Place Heebo-Regular.ttf in public/fonts/`
    );
  }

  const fontBytes = fs.readFileSync(fontPath);
  return pdfDoc.embedFont(fontBytes);
}

export async function generateSignedPdf(formData: FormData): Promise<string> {
  const templatePath = path.join(process.cwd(), "public", "template.pdf");

  let pdfDoc: PDFDocument;

  if (fs.existsSync(templatePath)) {
    const templateBytes = fs.readFileSync(templatePath);
    pdfDoc = await PDFDocument.load(templateBytes);
  } else {
    pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([595.28, 841.89]);
    pdfDoc.addPage([595.28, 841.89]);
    pdfDoc.addPage([595.28, 841.89]);
  }

  const font = await loadHebrewFont(pdfDoc);
  const pages = pdfDoc.getPages();
  const dateStr = formatDate();

  const sigBytes = decodeBase64Png(formData.signature);
  const signatureImage = await pdfDoc.embedPng(sigBytes);

  // --- PAGE 1: Personal Info ---
  const page1 = pages[0];
  const p1 = PDF_FIELD_MAPPING.page1;

  page1.drawText(formData.fullName, {
    x: p1.fullName.x,
    y: p1.fullName.y,
    size: p1.fullName.fontSize ?? 12,
    font,
    color: rgb(0, 0, 0),
  });

  page1.drawText(formData.idNumber, {
    x: p1.idNumber.x,
    y: p1.idNumber.y,
    size: p1.idNumber.fontSize ?? 12,
    font,
    color: rgb(0, 0, 0),
  });

  page1.drawText(dateStr, {
    x: p1.date.x,
    y: p1.date.y,
    size: p1.date.fontSize ?? 11,
    font,
    color: rgb(0, 0, 0),
  });

  const sig1 = p1.signature as SignaturePosition;
  page1.drawImage(signatureImage, {
    x: sig1.x,
    y: sig1.y,
    width: sig1.width,
    height: sig1.height,
  });

  // --- PAGE 2: Medical Questions ---
  const page2 = pages[1];
  const p2 = PDF_FIELD_MAPPING.page2;

  for (const question of MEDICAL_QUESTIONS) {
    const pos = p2[question.id as keyof typeof p2];
    if (pos) {
      const answer = formData.medicalAnswers[question.id] ? "כן" : "לא";
      page2.drawText(answer, {
        x: pos.x,
        y: pos.y,
        size: pos.fontSize ?? 11,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  if (formData.medications) {
    page2.drawText(formData.medications, {
      x: p2.medications.x,
      y: p2.medications.y,
      size: p2.medications.fontSize ?? 10,
      font,
      color: rgb(0, 0, 0),
    });
  }

  if (formData.allergies) {
    page2.drawText(formData.allergies, {
      x: p2.allergies.x,
      y: p2.allergies.y,
      size: p2.allergies.fontSize ?? 10,
      font,
      color: rgb(0, 0, 0),
    });
  }

  if (formData.additionalNotes) {
    page2.drawText(formData.additionalNotes, {
      x: p2.additionalNotes.x,
      y: p2.additionalNotes.y,
      size: p2.additionalNotes.fontSize ?? 10,
      font,
      color: rgb(0, 0, 0),
    });
  }

  page2.drawText(dateStr, {
    x: p2.date.x,
    y: p2.date.y,
    size: p2.date.fontSize ?? 11,
    font,
    color: rgb(0, 0, 0),
  });

  const sig2 = p2.signature as SignaturePosition;
  page2.drawImage(signatureImage, {
    x: sig2.x,
    y: sig2.y,
    width: sig2.width,
    height: sig2.height,
  });

  // --- PAGE 3: Final Consent ---
  const page3 = pages[2];
  const p3 = PDF_FIELD_MAPPING.page3;

  page3.drawText(formData.fullName, {
    x: p3.fullName.x,
    y: p3.fullName.y,
    size: p3.fullName.fontSize ?? 12,
    font,
    color: rgb(0, 0, 0),
  });

  page3.drawText(dateStr, {
    x: p3.date.x,
    y: p3.date.y,
    size: p3.date.fontSize ?? 11,
    font,
    color: rgb(0, 0, 0),
  });

  const sig3 = p3.signature as SignaturePosition;
  page3.drawImage(signatureImage, {
    x: sig3.x,
    y: sig3.y,
    width: sig3.width,
    height: sig3.height,
  });

  // --- Save PDF ---
  const pdfBytes = await pdfDoc.save();

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const dir = path.join(process.cwd(), "storage", "signed-forms", year, month);
  fs.mkdirSync(dir, { recursive: true });

  const safeName = sanitizeFilename(formData.fullName);
  const safeId = formData.idNumber;
  const fileDateStr = `${now.getFullYear()}-${month}-${String(now.getDate()).padStart(2, "0")}`;
  const filename = `${safeId}_${safeName}_${fileDateStr}.pdf`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, pdfBytes);

  const relativePath = path.relative(process.cwd(), filepath);
  return relativePath;
}
