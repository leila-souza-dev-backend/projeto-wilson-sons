import { createFileRoute } from "@tanstack/react-router";
import { webhookPayloadSchema, type WebhookPayload } from "@/lib/webhook-schema";

// Armazena os payloads recebidos do Make em memória (por jobId).
// Observação: a memória é por instância do worker; para produção
// utilize um banco de dados / Lovable Cloud.
type StoredEntry = { data: WebhookPayload; receivedAt: number };
const store = ((globalThis as unknown as { __wsWebhookStore?: Map<string, StoredEntry> }).__wsWebhookStore ??=
  new Map<string, StoredEntry>());

// Limite defensivo do corpo recebido (1 MB) para evitar abuso.
const MAX_BODY_BYTES = 1_000_000;

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

        // Lê corpo bruto respeitando o limite de tamanho
        let raw: string;
        try {
          raw = await request.text();
        } catch {
          return json({ error: "Falha ao ler o corpo da requisição" }, 400);
        }
        if (raw.length > MAX_BODY_BYTES) {
          return json({ error: "Payload excede o tamanho máximo permitido" }, 413);
        }

        let parsed: unknown;
        try {
          parsed = raw.length ? JSON.parse(raw) : null;
        } catch {
          return json({ error: "JSON inválido" }, 400);
        }

        // jobId pode vir no corpo
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const maybe = (parsed as Record<string, unknown>).jobId;
          if (typeof maybe === "string" && maybe.length > 0) jobId = maybe;
        }

        // Valida o schema antes de armazenar / repassar
        const result = webhookPayloadSchema.safeParse(parsed);
        if (!result.success) {
          return json(
            {
              error: "Payload inválido",
              issues: result.error.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
              })),
            },
            422,
          );
        }

        store.set(jobId, { data: result.data, receivedAt: Date.now() });

        // Limpa entradas antigas (>1h) para evitar crescimento indefinido
        const cutoff = Date.now() - 60 * 60 * 1000;
        for (const [k, v] of store) if (v.receivedAt < cutoff) store.delete(k);

        return json({ ok: true, jobId, itens: result.data.itens.length });
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
