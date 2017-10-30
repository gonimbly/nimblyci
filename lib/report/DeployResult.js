import _ from 'lodash';
import RunTestResult from './RunTestResult';
import ComponentResults from './ComponentResults';

export const logReport = res => {
  const deployResult = new DeployResult(res);
  deployResult.logReport();
};

class DeployResult {
  constructor(deployResult) {
    this.runTestResult = new RunTestResult(deployResult.details);
    this.componentResults = new ComponentResults(deployResult.details);

    console.log(JSON.stringify(deployResult.details, null, 2));
    Object.keys(deployResult).forEach(key => {
      this[key] = deployResult[key];
    });
  }

  statusMessage() {
    let msg = '';
    let state = this.status || this.state;
    if (state != null) {
      state = (() => {
        switch (state) {
          case 'InProgress':
            return 'In Progress';
          default:
            return state;
        }
      })();
      msg +=
        state +
        (() => {
          switch (state) {
            case 'Canceled':
              return ` by ${this.canceledByName}`;
            case 'Canceling':
              return '';
            default:
              return this.stateDetail != null ? ` -- ${this.stateDetail}` : '';
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
    if (failures.components.length) {
      this.componentResults.reportFailures(failures.components);
    }
    if (failures.tests.length) {
      this.runTestResult.reportFailures(failures.tests);
    }
  }

  logReport() {
    if (this.success === 'SucceededPartial') {
      console.log('Deployment partially succeeded.');
    } else if (this.success) {
      console.log('Deploy succeeded.');
    } else if (this.done) {
      console.log('Deploy failed.');
    } else {
      console.log('Deploy not completed yet.');
    }
    if (this.errorMessage) {
      console.log(`${this.errorStatusCode}: ${this.errorMessage}`);
    }
    console.log();
    console.log(`Id: ${this.id}`);
    console.log(`Status: ${this.status}`);
    console.log(`Success: ${this.success}`);
    console.log(`Done: ${this.done}`);
    console.log(`Component Errors: ${this.numberComponentErrors}`);
    console.log(`Components Deployed: ${this.numberComponentsDeployed}`);
    console.log(`Components Total: ${this.numberComponentsTotal}`);
    console.log(`Test Errors: ${this.numberTestErrors}`);
    console.log(`Tests Completed: ${this.numberTestsCompleted}`);
    console.log(`Tests Total: ${this.numberTestsTotal}`);
    console.log('');

    this.componentResults.logFailures();

    const successes = _.compact(_.flatten(this.componentSuccesses));
    if (successes.length) {
      console.log('Successes:');
      return successes.forEach(s => {
        const flag = (() => {
          switch (true) {
            case `${s.changed}`:
              return '(M)';
            case `${s.created}`:
              return '(A)';
            case `${s.deleted}`:
              return '(D)';
            default:
              return '(~)';
          }
        })();
        return console.log(
          ` - ${flag} ${s.fileName}${s.componentType
            ? ` [${s.componentType}]`
            : ''}`
        );
      });
    }
    return '';
  }
}
