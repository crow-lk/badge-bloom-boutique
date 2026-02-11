export const normalizeStatus = (status?: string | number | null) => {
  if (status === undefined || status === null) return "";
  return String(status).trim().toLowerCase();
};

export const isActiveStatus = (status?: string | number | null) => {
  const normalized = normalizeStatus(status);
  return normalized === "" || normalized === "active";
};

export const filterActiveProducts = <T extends { status?: string | number | null }>(products: T[]) =>
  products.filter((product) => isActiveStatus(product.status));

const toNumericId = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
};

export const sortProductsNewestFirst = <T extends { id?: number | string | null }>(products: T[]) =>
  [...products].sort((a, b) => toNumericId(b.id) - toNumericId(a.id));
