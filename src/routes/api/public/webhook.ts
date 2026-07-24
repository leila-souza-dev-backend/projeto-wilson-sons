import { createFileRoute } from "@tanstack/react-router";

// Armazena os payloads recebidos do Make em memória (por jobId).
// Observação: a memória é por instância do worker; para produção
// utilize um banco de dados / Lovable Cloud.
const store = ((globalThis as unknown as { __wsWebhookStore?: Map<string, { data: unknown; receivedAt: number }> }).__wsWebhookStore ??=
  new Map<string, { data: unknown; receivedAt: number }>());

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

export const Route = createFileRoute("/api/public/webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),

      // Make chama este endpoint com o JSON resultante da automação.
      // Aceita `?jobId=...` na URL ou o campo `jobId` no corpo JSON.
      POST: async ({ request }) => {
        const url = new URL(request.url);
        let jobId = url.searchParams.get("jobId") ?? "latest";

        const contentType = request.headers.get("content-type") ?? "";
        let payload: unknown;

        try {
          if (contentType.includes("application/json")) {
            payload = await request.json();
          } else {
            const text = await request.text();
            try {
              payload = JSON.parse(text);
            } catch {
              payload = text;
            }
          }
        } catch {
          return json({ error: "Corpo inválido" }, 400);
        }

        if (payload && typeof payload === "object" && "jobId" in (payload as Record<string, unknown>)) {
          const maybe = (payload as Record<string, unknown>).jobId;
          if (typeof maybe === "string" && maybe.length > 0) jobId = maybe;
        }

        store.set(jobId, { data: payload, receivedAt: Date.now() });

        // Limpa entradas antigas (>1h) para evitar crescimento indefinido
        const cutoff = Date.now() - 60 * 60 * 1000;
        for (const [k, v] of store) if (v.receivedAt < cutoff) store.delete(k);

        return json({ ok: true, jobId });
      },

      // A página faz polling neste endpoint até o Make responder.
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const jobId = url.searchParams.get("jobId") ?? "latest";
        const entry = store.get(jobId);
        if (!entry) return json({ ready: false }, 200);
        return json({ ready: true, jobId, receivedAt: entry.receivedAt, data: entry.data });
      },
    },
  },
});
