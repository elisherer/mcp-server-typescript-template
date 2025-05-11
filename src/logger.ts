import winston from "winston";
import type { Request, Express } from "express";

const enumerateErrorFormat = winston.format(info => {
  const msg = info.message as any;
  if (msg instanceof Error) {
    info.message = Object.assign(
      {
        message: msg.message,
        stack: msg.stack,
      },
      info.message
    );
  }

  if ((info as any) instanceof Error) {
    return Object.assign(
      {
        message: info.message,
        stack: info.stack,
      },
      info
    );
  }

  return info;
});

const loggerFormat = process.env["logging.format"] || "simple"; // "simple" | "json"
const loggerFormats: Record<string, any> = {
  simple: winston.format.combine(
    winston.format.timestamp(),
    enumerateErrorFormat(),
    winston.format.colorize(),
    winston.format.printf(
      ({ timestamp, level, message, pid, logger, ...rest }) =>
        `${timestamp} ${level.padEnd(15, " ")} ${pid} --- ${logger?.toString().padEnd(16, " ")}: ${
          (message as any).message
            ? `${(message as any).message} ${(message as any).stack}`
            : typeof message === "object"
            ? JSON.stringify(message)
            : message
        } ${Object.keys(rest).length > 0 ? JSON.stringify(rest) : ""}`
    )
  ),
  json: winston.format.combine(winston.format.timestamp(), enumerateErrorFormat(), winston.format.json()),
};

const lg = winston.createLogger({
  level: "debug",
  format: loggerFormats[loggerFormat] || loggerFormats.simple,
  exitOnError: false,
  transports: [new winston.transports.Console()],
});

const loggingLevelMap: Record<string, number> = {
  DEBUG: 20,
  INFO: 30,
  WARN: 40,
  ERROR: 50,
};

const defaultMinLevel = "DEBUG";
const loggingLevel =
  loggingLevelMap[process.env["logging.level"] || defaultMinLevel] || loggingLevelMap[defaultMinLevel];

enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export type LogMethod = (msg: any, context?: { req?: Request; user?: any }, ...args: any[]) => void;

const noop: LogMethod = () => {};

const logFunctionFactory = (level: LogLevel, name: string): LogMethod => {
  if (loggingLevel > loggingLevelMap[level]) return noop;
  return (msg, ...args: any[]) => {
    const pid = process.pid.toString();
    const meta: Record<string, any> = { pid, logger: name };

    switch (level) {
      case LogLevel.DEBUG:
        lg.debug(msg, meta, ...args);
        break;
      case LogLevel.INFO:
        lg.info(msg, meta, ...args);
        break;
      case LogLevel.WARN:
        lg.warn(msg, meta, ...args);
        break;
      case LogLevel.ERROR:
        lg.error(msg, meta, ...args);
        break;
    }
  };
};

export const createLogger = (name: string) => ({
  debug: logFunctionFactory(LogLevel.DEBUG, name),
  info: logFunctionFactory(LogLevel.INFO, name),
  warn: logFunctionFactory(LogLevel.WARN, name),
  error: logFunctionFactory(LogLevel.ERROR, name),
});

export const loggerMiddleware = (app: Express) => {
  const logger = createLogger("loggerMiddleware");

  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`, { req });
    return next();
  });
};
