export const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
export const isPhone = (v) => typeof v === "string" && /^[0-9+\-\s()]{7,20}$/.test(v);
export const isStr = (v, max = 255) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
export const bad = (res, message) => res.status(400).json({ success: false, message });