import _ from 'lodash';

export default class RunTestResult {
  constructor(deployDetails = {}) {
    Object.keys(deployDetails).forEach(key => {
      this[key] = deployDetails[key];
    });
    this.failures = _([deployDetails.failures])
      .flatten()
      .compact()
      .value();
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
    console.log(sep);
    console.log('Test Failures:');

    failures.forEach((failure, i) => {
      const num = `${i + 1}. `;
      const indent = _.repeat(' ', num.length);
      console.log(`${num}${failure.name}.${failure.methodName}`);
      console.log(indent + failure.message);
      failure.stackTrace
        .split('\n')
        .forEach(line => console.log(`${indent}${line}`));
    });
    console.log(sep);
  }
}
