import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // Check DB
  try {
    const count = await prisma.signedForm.count();
    checks.database = { ok: true, formCount: count };
  } catch (e) {
    checks.database = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // Check storage dir
  const storageDir = path.join(process.cwd(), "storage", "signed-forms");
  checks.storage = {
    path: storageDir,
    exists: fs.existsSync(storageDir),
  };

  // Check template
  const templatePath = path.join(process.cwd(), "public", "template.pdf");
  checks.template = {
    path: templatePath,
    exists: fs.existsSync(templatePath),
  };

  checks.cwd = process.cwd();

  const allOk = (checks.database as { ok: boolean }).ok;
  return NextResponse.json(checks, { status: allOk ? 200 : 503 });
}
