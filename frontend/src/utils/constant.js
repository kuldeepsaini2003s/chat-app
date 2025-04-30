export function formatBytes(bytes) {
  if (bytes === 0) return "0 KB";

  const KB = 1024;
  const MB = KB * 1024;

  if (bytes >= MB) {
    const mb = Math.round(bytes / MB);
    return mb + " MB";
  } else {
    const kb = Math.round(bytes / KB);
    return kb + " KB";
  }
}

export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const LOCAL_BACKEND = import.meta.env.VITE_BACKEND_URL;

export const LOCAL_USER = `${LOCAL_BACKEND}/user`;
export const LOCAL_MESSAGE = `${LOCAL_BACKEND}/message`;


