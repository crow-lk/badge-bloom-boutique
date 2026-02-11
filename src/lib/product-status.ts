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
