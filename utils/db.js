// Sirf bheje gaye (undefined nahi) whitelisted fields se UPDATE banata hai.
// Isse "field clear karna" (null / "") bhi possible hai, aur undefined bind error nahi aata.
export const buildUpdate = (table, idCol, id, data) => {
  const keys = Object.keys(data);
  const sql = `UPDATE ${table} SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE ${idCol} = ?`;
  return [sql, [...keys.map((k) => data[k]), id]];
};

export const pickDefined = (body, fields) =>
  Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

export const emptyToNull = (v) => (typeof v === "string" && v.trim() === "" ? null : v);

export const getPagination = (query, defLimit = 10, maxLimit = 100) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || defLimit, 1), maxLimit);
  return { page, limit, offset: (page - 1) * limit };
};

export const paginated = (data, total, { page, limit }) => ({
  success: true,
  data,
  pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
});