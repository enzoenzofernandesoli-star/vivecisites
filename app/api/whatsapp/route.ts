import { NextResponse } from "next/server";
import { getViveciWhatsAppNumber } from "@/lib/viveci-contact";

const defaultMessage = "Olá! Quero conhecer as soluções de sites da Viveci.";

export function GET() {
  const businessNumber = getViveciWhatsAppNumber();

  return NextResponse.redirect(`https://wa.me/${businessNumber}?text=${encodeURIComponent(defaultMessage)}`, 303);
}
