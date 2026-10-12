import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

describe('logging', () => {
  it('create logger', () => {
    const logger = winston.createLogger({
      level: 'debug',
      transports: [new winston.transports.Console({})],
    });

    logger.info('Hello World.');
  });

  it('format logger', () => {
    const logger = winston.createLogger({
      level: 'debug',
      // format default JSON
      // format: winston.format.printf((info) => {
      //   return `${new Date()} : ${info.level.toUpperCase()} : ${info.message}`;
      // }),
      // format combine
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [new winston.transports.Console({})],
    });

    logger.info('Hello World.');
  });
  it('file transport logger', () => {
    const logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.Console({}),
        new winston.transports.File({
          filename: 'transport.log',
        }),
      ],
    });

    logger.info('Hello World.');
  });
  it('file transport logger file', () => {
    const logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.Console({}),
        new winston.transports.File({
          filename: 'transport.log',
        }),
        new winston.transports.File({
          level: 'error',
          filename: 'transport-error.log',
        }),
      ],
    });

    logger.info('Hello World.');
    logger.info('Hello World.');
    logger.error('Hello Error!.');
    logger.error('Hello Error!.');
  });

  it('file rotate file', () => {
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.Console({}),
        new DailyRotateFile({
          filename: 'app-%Date%.log',
          zippedArchive: true,
          maxSize: '1m',
          maxFiles: '14d',
        }),
      ],
    });

    for (let index = 0; index < 30000; index++) {
      logger.info('Hello ' + index);
    }
  });
});
