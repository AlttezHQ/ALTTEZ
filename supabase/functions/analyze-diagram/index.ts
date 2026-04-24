import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://alttez.co",
  "http://localhost:5173",
  "http://localhost:4173",
];

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// ~3 MB decoded limit for base64 payload
const MAX_BASE64_BYTES = 4_000_000;

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

const TACTICAL_PROMPT = `Eres un asistente de diagramacion deportiva. Se te proporciona una imagen de un diagrama tactico de futbol (pizarra, foto, boceto).

Genera un SVG minimalista (200x160px) que represente el diagrama:
- Fondo verde oscuro (#0a2010)
- Lineas del campo en blanco con opacidad 0.15
- Jugadores como circulos de 8px: equipo propio en #39FF14, rival en #ef4444
- Flechas de movimiento en rgba(255,255,255,0.6), strokeWidth 1.5, markerEnd flecha
- Sin texto, sin labels, sin elementos fuera del viewBox
- Solo SVG valido. Sin markdown, sin explicacion, sin bloque de codigo.
Responde UNICAMENTE con el SVG.`;

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // H1 fix: verificar JWT real contra Supabase, no solo presencia del header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase env vars missing");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: "imagen_invalida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar mime type contra allowlist
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return new Response(
        JSON.stringify({ error: "tipo_imagen_no_permitido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    // Limitar tamaño para evitar abuso de presupuesto
    if (base64Data.length > MAX_BASE64_BYTES) {
      return new Response(
        JSON.stringify({ error: "imagen_demasiado_grande" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY no configurada");

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: base64Data } },
            { type: "text", text: TACTICAL_PROMPT },
          ],
        }],
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!anthropicRes.ok) {
      console.error("Anthropic error:", anthropicRes.status, await anthropicRes.text());
      return new Response(
        JSON.stringify({ error: "api_error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await anthropicRes.json();
    const rawSvg = data?.content?.[0]?.text ?? "";
    const svgMatch = rawSvg.match(/<svg[\s\S]*<\/svg>/i);
    const svg = svgMatch ? svgMatch[0] : rawSvg;

    return new Response(
      JSON.stringify({ svg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    console.error("analyze-diagram error:", err);
    return new Response(
      JSON.stringify({ error: isTimeout ? "timeout" : "api_error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
