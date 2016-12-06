import _ from 'lodash';
import logger from '../logger';

export default class ComponentResults {

  constructor(deployDetails = {}) {
    _.apply(this, deployDetails);
    this.successes = deployDetails.componentSuccesses || [];
    this.failures = deployDetails.componentFailures || [];
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
    logger.info('Component Failures:');

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
