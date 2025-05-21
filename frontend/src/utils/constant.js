const LOCAL_BACKEND = import.meta.env.VITE_BACKEND_URL_LOCAL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const BACKEND_USER = `${BACKEND_URL}/api/user`;
export const BACKEND_MESSAGE = `${BACKEND_URL}/api/message`;
export const BACKEND_SOCKET = `${BACKEND_URL}`;

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

export function getLastSeen(timeStr) {
  const now = new Date();
  const then = new Date(timeStr);

  const isToday = now.toDateString() === then.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isYesterday = then.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Last seen ${then.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else if (isYesterday) {
    return `Yesterday ${then.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  } else {
    return then.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
}

export const handleDownload = (url, filename) => {
  // insert fl_attachment into the Cloudinary URL to download file
  const downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
