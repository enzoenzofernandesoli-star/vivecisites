import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().min(8).max(24).regex(/^[+\d\s()-]+$/),
  business: z.string().trim().min(2).max(120),
  segment: z.string().trim().min(2).max(80),
  city: z.string().trim().max(100).optional().default(""),
  links: z.string().trim().max(500).optional().default(""),
  need: z.string().trim().max(120).optional().default(""),
  problem: z.string().trim().max(1200).optional().default(""),
  timing: z.string().trim().max(80).optional().default(""),
  website: z.string().max(0).optional().default("")
});

const attempts = new Map<string, { count: number; reset: number }>();
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const rate = attempts.get(ip);
  if (rate && rate.reset > now && rate.count >= 5) return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  attempts.set(ip, !rate || rate.reset <= now ? { count: 1, reset: now + 600_000 } : { ...rate, count: rate.count + 1 });
  try {
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "Revise os campos e tente novamente." }, { status: 400 });
    if (result.data.website) return NextResponse.json({ ok: true });
    // Production hook: persist or send result.data through a trusted provider using server-only env vars.
    return NextResponse.json({ ok: true, message: "Recebi. Vou olhar o seu negócio e te chamar no WhatsApp para montar o modelo." }, { status: 201 });
  } catch { return NextResponse.json({ error: "Não foi possível processar a solicitação." }, { status: 400 }); }
}
