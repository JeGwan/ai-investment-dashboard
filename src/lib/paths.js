export const assetPath = path => {
  const normalized = path.replace(/^\.\//, "");
  return `${import.meta.env.BASE_URL}${normalized}`;
};

export const documentBasePath = path => {
  const normalized = path.replace(/^\.\//, "");
  const parts = normalized.split("/");
  parts.pop();
  return `${import.meta.env.BASE_URL}${parts.join("/")}/`;
};
