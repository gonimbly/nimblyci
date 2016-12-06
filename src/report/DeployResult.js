import _ from 'lodash';
import logger from '../logger';
import RunTestResult from './RunTestResult';
import ComponentResults from './ComponentResults';

export default class DeployResult {

  constructor(deployResult) {
    _.apply(this, deployResult);
    this.runTestResult = new RunTestResult(deployResult.details);
    this.componentResults = new ComponentResults(deployResult.details);
  }

  statusMessage() {
    let msg = '';
    let state = this.status || this.state || 'Queued';
    if (state != null) {
      state = (() => {
        switch (state) {
          case 'InProgress': return 'In Progress';
          default: return state;
        }
      })();
      msg += state + (() => {
        switch (state) {
          case 'Canceled': return ` by ${this.canceledByName}`;
          case 'Canceling': return '';
          default: return (this.stateDetail != null) ? ` -- ${this.stateDetail}` : '';
        }
      })();
    }
    return msg;
  }

  getRecentFailures(old) {
    return {
      components: this.componentResults.getRecentFailures(old.componentResults),
      tests: this.runTestResult.getRecentFailures(old.runTestResult),
    };
  }

  reportFailures(failures = { tests: [], components: [] }) {
    logger.info(failures);
    if (failures.components.length) {
      this.componentResults.reportFailures(failures.components);
    }
    if (failures.tests.length) {
      this.runTestResult.reportFailures(failures.tests);
    }
  }

  static logReport(res) {
    const deployResult = new DeployResult(res);
    deployResult.logReport();
  }

  logReport() {
    if (this.success === 'SucceededPartial') {
      logger.info('Deployment partially succeeded.');
    } else if (this.success) {
      logger.info('Deploy succeeded.');
    } else if (this.done) {
      logger.info('Deploy failed.');
    } else {
      logger.info('Deploy not completed yet.');
    }
    if (this.errorMessage) {
      logger.info(`${this.errorStatusCode}: ${this.errorMessage}`);
    }
    logger.info();
    logger.info(`Id: ${this.id}`);
    logger.info(`Status: ${this.status}`);
    logger.info(`Success: ${this.success}`);
    logger.info(`Done: ${this.done}`);
    logger.info(`Component Errors: ${this.numberComponentErrors}`);
    logger.info(`Components Deployed: ${this.numberComponentsDeployed}`);
    logger.info(`Components Total: ${this.numberComponentsTotal}`);
    logger.info(`Test Errors: ${this.numberTestErrors}`);
    logger.info(`Tests Completed: ${this.numberTestsCompleted}`);
    logger.info(`Tests Total: ${this.numberTestsTotal}`);
    logger.info('');

    const failures = _.compact(_.flatten(this.componentFailures));
    if (failures.length) {
      logger.info('Failures:');
      failures.forEach(f => logger.info(` - ${f.problemType} on ${f.fileName} : ${f.problem}`));
    }

    const successes = _.compact(_.flatten(this.componentSuccesses));
    if (successes.length) {
      logger.info('Successes:');
      return successes.forEach((s) => {
        const flag = (() => {
          switch (true) {
            case `${s.changed}`: return '(M)';
            case `${s.created}`: return '(A)';
            case `${s.deleted}`: return '(D)';
            default: return '(~)';
          }
        })();
        return logger.info(` - ${flag} ${s.fileName}${s.componentType ? ` [${s.componentType}]` : ''}`);
      });
    }
    return '';
  }
}
