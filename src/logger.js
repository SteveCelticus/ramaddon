const winston = require('winston');

// Configurazione del logger con Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${level.toUpperCase()}] ${timestamp} - ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'addon.log' })
    ]
});

module.exports = logger;

