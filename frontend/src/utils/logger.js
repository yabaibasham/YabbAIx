// Lightweight logger — replaces raw console.* in production
const isDev = process.env.NODE_ENV !== "production";

const logger = {
  error: (msg, ...args) => {
    if (isDev) console.error(`[YABBAI] ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    if (isDev) console.warn(`[YABBAI] ${msg}`, ...args);
  },
  info: (msg, ...args) => {
    if (isDev) console.info(`[YABBAI] ${msg}`, ...args);
  },
};

export default logger;
