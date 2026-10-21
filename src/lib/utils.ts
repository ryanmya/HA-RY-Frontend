import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Teach tailwind-merge about our type-* presets (index.css) so the last one wins,
// e.g. cn("type-page-title", "type-card-title") -> "type-card-title"
const twMerge = extendTailwindMerge<"type-preset">({
  extend: {
    classGroups: {
      "type-preset": [
        {
          type: [
            "display",
            "page-title",
            "section",
            "card-title",
            "price",
            "price-original",
            "body",
            "table",
            "meta",
            "label",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: number,
  currency = "IDR",
  locale = "id-ID"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(value)
}
