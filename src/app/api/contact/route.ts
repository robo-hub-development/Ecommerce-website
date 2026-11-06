import { NextResponse } from "next/server";
import { sendContactWithBackend } from "@/lib/api/contact-backend";
import { errorResponse, readJson, validationErrorResponse } from "@/lib/auth/route-helpers";
import { contactSchema } from "@/lib/validations/contact";

export async function POST(request: Request) {
  const body = await readJson(request);
  // Honeypot: pretend it worked so bots get no signal, but never forward the message.
  if (typeof body === "object" && body !== null && "website" in body && body.website) {
    return NextResponse.json({ sent: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  try {
    const message = { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, message: parsed.data.message };
    return NextResponse.json(await sendContactWithBackend(message));
  } catch (error) {
    return errorResponse(error);
  }
}
