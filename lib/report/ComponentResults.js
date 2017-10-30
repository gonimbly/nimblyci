import _ from 'lodash';

export default class ComponentResults {
  constructor(deployDetails = {}) {
    Object.keys(deployDetails).forEach(key => {
      this[key] = deployDetails[key];
    });
  }

  getRecentFailures(old = {}) {
    if (old.numFailures) {
      return this.componentFailures.slice(old.numFailures);
    }
    return [];
  }

  logFailures() {
    if (!this.componentFailures.length) {
      return;
    }
    const sep = _.repeat('-', 80);
    console.log(sep);
    console.log('Component Failures:');

    this.componentFailures.forEach((failure, i) => {
      const num = `${i + 1}. `;
      const indent = _.repeat(' ', num.length);
      // console.log(failure);
      let msg = `${num}${failure.fullName}`;
      if (failure.methodName) {
        msg += `.${failure.methodName}`;
      }
      if (failure.lineNumber) {
        msg += ` (line ${failure.lineNumber})`;
      }
      console.log(msg);
      console.log(indent + failure.problem);
      if (failure.stackTrace) {
        failure.stackTrace
          .split('\n')
          .forEach(line => console.log(`${indent}${line}`));
      }
    });
    console.log(sep);
  }
}
