import _ from 'lodash';
import winston from 'winston';

winston.emitErrs = true;
winston.cli();

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      json: false,
      prettyPrint: true,
      colorize: true,
      timestamp: false,
    }),
  ],
  exitOnError: true,
});

logger.cli();
logger.setLevels({ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 });

logger.log = _.wrap(logger.log, (fn, ...args) => {
  const [level] = args;
  if (!logger.levels[level]) {
    args.unshift('info');
  }
  fn.apply(logger, args);
});

logger.stream = {
  write: message => logger.info(message),
};

export default logger;
