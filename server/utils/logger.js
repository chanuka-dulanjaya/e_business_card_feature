import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'application.log');

const formatDate = () => {
  return new Date().toISOString();
};

const writeLog = (level, message, meta = {}) => {
  const logEntry = {
    timestamp: formatDate(),
    level,
    message,
    ...meta
  };

  const logLine = JSON.stringify(logEntry) + '\n';

  // Write to file
  fs.appendFileSync(logFilePath, logLine);

  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    const consoleMessage = `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`;
    if (level === 'error') {
      console.error(consoleMessage, meta);
    } else {
      console.log(consoleMessage, meta);
    }
  }
};

export const logger = {
  info: (message, meta) => writeLog('info', message, meta),
  error: (message, meta) => writeLog('error', message, meta),
  warn: (message, meta) => writeLog('warn', message, meta),
  debug: (message, meta) => writeLog('debug', message, meta),
};

export default logger;
