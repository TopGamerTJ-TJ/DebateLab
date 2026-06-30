const blockedTerms = [
  "kill yourself",
  "kys",
  "nazi",
  "terrorist threat",
  "racial slur",
  "sexual threat"
];

export function hasObjectionableContent(text = "") {
  const normalized = text.toLowerCase();
  return blockedTerms.some((term) => normalized.includes(term));
}

export function getVisibleItems(items = [], blockedUsers = []) {
  const blockedIds = new Set(blockedUsers.map((b) => b.blockedUserId));
  return items.filter((item) => !blockedIds.has(item.created_by_id));
}