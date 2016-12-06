import _ from 'lodash';
import logger from '../logger';

export default class RunTestResult {

  constructor(deployDetails = {}) {
    _.apply(this, deployDetails);
    this.failures = _([deployDetails.failures]).flatten().compact().value();
  }

  getRecentFailures(old = {}) {
    if (old.numFailures) {
      return this.failures.slice(old.numFailures);
    }
    return [];
  }

  logFailures(failures = []) {
    if (!failures.length) {
      return;
    }
    const sep = _.repeat('-', 80);
    logger.info(sep);
    logger.info('Test Failures:');

    failures.forEach((failure, i) => {
      const num = `${i + 1}. `;
      const indent = _.repeat(' ', num.length);
      logger.info(`${num}${failure.name}.${failure.methodName}`);
      logger.info(indent + failure.message);
      failure.stackTrace.split('\n').forEach(line => logger.info(`${indent}${line}`));
    });
    logger.info(sep);
  }
}
