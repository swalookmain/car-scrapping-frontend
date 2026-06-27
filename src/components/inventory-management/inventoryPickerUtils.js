const CATEGORY_COLORS = {
  engine: { bg: '#e3f2fd', color: '#1565c0' },
  transmission: { bg: '#f3e5f5', color: '#6a1b9a' },
  brakes: { bg: '#ede7f6', color: '#4527a0' },
  suspension: { bg: '#e8eaf6', color: '#3949ab' },
  electrical: { bg: '#fff9c4', color: '#f57f17' },
  exhaust: { bg: '#efebe9', color: '#5d4037' },
  body: { bg: '#fff3e0', color: '#e65100' },
  plastic: { bg: '#fce4ec', color: '#ad1457' },
  metal: { bg: '#e0f2f1', color: '#00695c' },
  other: { bg: '#f5f5f5', color: '#616161' },
};

export function normalizeCategory(value) {
  if (!value || typeof value !== 'string') return 'other';
  return value.trim().toLowerCase();
}

export function formatCategoryLabel(value) {
  const slug = normalizeCategory(value);
  if (!slug) return '';
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function getCategoryColor(slug) {
  const key = normalizeCategory(slug);
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.other;
}

export function getPartKey(part) {
  if (part.catalogPartId) return `cat_${part.catalogPartId}`;
  if (part._uid) return part._uid;
  return `custom_${normalizeCategory(part.partType)}_${(part.partName || '').trim().toLowerCase()}`;
}

export function groupByCategory(parts, categoryOrder = []) {
  const grouped = {};
  (parts || []).forEach((part) => {
    const key = normalizeCategory(part.partType);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(part);
  });

  const keys = Object.keys(grouped);
  const ordered = [
    ...categoryOrder.filter((k) => keys.includes(normalizeCategory(k))),
    ...keys
      .filter((k) => !categoryOrder.map(normalizeCategory).includes(k))
      .sort((a, b) => formatCategoryLabel(a).localeCompare(formatCategoryLabel(b))),
  ];

  return ordered.map((key) => ({
    slug: key,
    label: formatCategoryLabel(key),
    parts: grouped[key],
  }));
}

export function isDuplicateCategory(name, categories) {
  const slug = normalizeCategory(name);
  return (categories || []).some((c) => normalizeCategory(c.slug || c) === slug);
}
