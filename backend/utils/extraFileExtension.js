export function extraFileExtension(url) {
  const result = url.split("/").pop();
  const extension = result.includes(".") ? result.split(".").pop() : "";
  return extension;
}
