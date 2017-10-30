#!/usr/bin/env node
'use strict';

const nimblyci = require('../dist/nimblyci');
const chalk = require('chalk');

const [, , task, ...args] = process.argv;

const tasks = {
  deploy: 'deploy',
  test: 'test',
  'add-packages': 'addPackages',
};

const error = message => {
  console.error(chalk`{red error} ${message}`);
  process.exit(1);
};

if (Object.keys(tasks).includes(task)) {
  try {
    nimblyci.checkEnv();
  } catch (err) {
    error(err.message);
  }
  nimblyci[tasks[task]](...args).catch(err => {
    error(JSON.stringify(err, null, 2));
  });
} else {
  error(`"${task || ''}" is not a valid task`);
}
