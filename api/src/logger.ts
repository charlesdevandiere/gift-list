import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const serverFormat = [
  format.timestamp(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
]

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'error',
  transports: [
    new transports.DailyRotateFile({
      dirname: './logs',
      filename: 'server_%DATE%',
      extension: '.log',
      createSymlink: true,
      symlinkName: 'server.current.log',
      utc: true,
      maxSize: '100m',
      maxFiles: 30,
      auditFile: './logs/.audit.json',
      format: format.combine(...serverFormat)
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        ...serverFormat,
      )
    })
  ]
})
