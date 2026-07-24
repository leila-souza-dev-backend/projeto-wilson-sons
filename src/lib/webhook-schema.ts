import { z } from "zod";

/**
 * Schema esperado do payload retornado pelo Make (automação Wilson Sons).
 *
 * O fluxo pode retornar tanto um objeto contendo metadados do documento
 * e uma lista de materiais, quanto diretamente a lista. Aceitamos ambos e
 * normalizamos para um formato único.
 */

const numberLike = z.union([
  z.number(),
  z
    .string()
    .trim()
    .regex(/^-?\d+(?:[.,]\d+)?$/, "Valor numérico inválido")
    .transform((s) => Number(s.replace(",", "."))),
]);

const trimmedString = (max: number) =>
  z.string().trim().min(1).max(max);

export const materialItemSchema = z
  .object({
    codigo: trimmedString(64).optional(),
    descricao: trimmedString(500),
    quantidade: numberLike,
    unidade: trimmedString(32).optional(),
    observacao: z.string().trim().max(1000).optional(),
  })
  .passthrough();

export const materialListSchema = z
  .object({
    documento: trimmedString(200).optional(),
    data: trimmedString(64).optional(),
    fornecedor: trimmedString(200).optional(),
    itens: z.array(materialItemSchema).max(5000),
  })
  .passthrough();

/** Aceita: { itens: [...] } | { items: [...] } | [ ... ] */
export const webhookPayloadSchema = z
  .unknown()
  .transform((raw) => {
    if (Array.isArray(raw)) return { itens: raw };
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.items) && !("itens" in obj)) {
        const { items, ...rest } = obj;
        return { ...rest, itens: items };
      }
    }
    return raw;
  })
  .pipe(materialListSchema);

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
