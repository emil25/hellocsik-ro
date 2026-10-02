export const normalizeSearchText = (value: string) => value.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("hu").replace(/\s+/g, " ").trim();
