import type { VariationGroup, VariationOption, ProductTab } from '@/models/Product';

export function cleanVariationGroups(variationGroups: unknown): VariationGroup[] {
  return (Array.isArray(variationGroups) ? variationGroups : [])
    .filter((g) => g?.name && Array.isArray(g.options) && g.options.length > 0)
    .map((g) => ({
      name: g.name,
      options: (g.options as VariationOption[])
        .filter((o) => o.label)
        .map((o) => ({ label: o.label, imageUrl: o.imageUrl || '' })),
    }))
    .filter((g) => g.options.length > 0);
}

export function cleanTabs(tabs: unknown): ProductTab[] {
  return (Array.isArray(tabs) ? tabs : [])
    .filter((t) => t?.name)
    .map((t) => ({ name: t.name, content: t.content || '' }));
}

export function cleanImages(images: unknown): string[] {
  return (Array.isArray(images) ? images : []).map((url) => String(url).trim()).filter(Boolean);
}
