import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getViveciWhatsAppNumber } from "@/lib/viveci-contact";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().min(8).max(24).regex(/^[+\d\s()-]+$/),
  business: z.string().trim().min(2).max(120),
  links: z.string().trim().max(240).optional().default(""),
  website: z.string().max(0).optional().default("")
});

const attempts = new Map<string, { count: number; reset: number }>();
export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 5_000) return NextResponse.json({ error: "Solicitação muito grande." }, { status: 413 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const rate = attempts.get(ip);
  if (rate && rate.reset > now && rate.count >= 5) return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  attempts.set(ip, !rate || rate.reset <= now ? { count: 1, reset: now + 600_000 } : { ...rate, count: rate.count + 1 });
  try {
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "Revise os campos e tente novamente." }, { status: 400 });
    if (result.data.website) return NextResponse.json({ ok: true });
    const businessNumber = getViveciWhatsAppNumber();
    const message = [
      "Olá! Quero ver uma proposta/modelo de site para minha empresa.",
      "",
      `Nome: ${result.data.name}`,
      `Empresa: ${result.data.business}`,
      `Instagram/Site: ${result.data.links || "Não informado"}`,
    ].join("\n");
    const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
    return NextResponse.json({ ok: true, whatsappUrl }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Não foi possível processar a solicitação." }, { status: 400 }); }
}
