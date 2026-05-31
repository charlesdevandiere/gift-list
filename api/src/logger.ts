import path from 'node:path';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const folder: string = process.env.LOG_FOLDER ?? '.'

const serverFormat = [
  format.timestamp(),
  format.printf((info) => `${info.timestamp as string} ${info.level}: ${info.message as string}`),
]

export const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'error',
  transports: [
    new transports.DailyRotateFile({
      dirname: folder,
      filename: 'server_%DATE%',
      extension: '.log',
      createSymlink: true,
      symlinkName: 'server.current.log',
      utc: true,
      maxSize: '100m',
      maxFiles: 30,
      auditFile: path.join(folder, '.audit.json'),
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
