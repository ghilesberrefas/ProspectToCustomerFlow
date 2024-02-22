import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

// Créez un format personnalisé pour le log
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Créez et exportez une instance de logger Winston
const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'app.log' }),
  ],
});

export default logger;