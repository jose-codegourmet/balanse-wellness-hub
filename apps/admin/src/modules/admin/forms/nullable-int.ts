import { z } from "zod";

/** Map blank optional number inputs to `null` before coerce ("" must not become 0). */
export function nullableInt(min: number, max?: number) {
  const numberSchema =
    max === undefined
      ? z.coerce.number().int().min(min)
      : z.coerce.number().int().min(min).max(max);

  return z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return null;
      return value;
    },
    z.union([z.null(), numberSchema]),
  );
}
