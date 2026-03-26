import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, setAdminSession, clearAdminSession } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = adminLoginSchema.parse(body);

    const valid = await verifyAdminCredentials(username, password);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: "שם משתמש או סיסמה שגויים" },
        { status: 401 }
      );
    }

    await setAdminSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "שגיאה בהתחברות" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "שגיאה בהתנתקות" },
      { status: 500 }
    );
  }
}
