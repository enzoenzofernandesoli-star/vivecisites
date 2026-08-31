import { NextRequest, NextResponse } from "next/server";

const defaultMessage = "Olá! Quero conhecer as soluções de sites da Viveci.";

export function GET(request: NextRequest) {
  const businessNumber = process.env.VIVECI_WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!businessNumber || !/^55\d{10,11}$/.test(businessNumber)) {
    return NextResponse.redirect(new URL("/#contato", request.url), 303);
  }

  return NextResponse.redirect(`https://wa.me/${businessNumber}?text=${encodeURIComponent(defaultMessage)}`, 303);
}
