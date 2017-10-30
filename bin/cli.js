#!/usr/bin/env node
'use strict';

const nimblyci = require('../dist/nimblyci');
const chalk = require('chalk');

const [, , task, ...args] = process.argv;

const tasks = ['deploy'];

if (tasks.indexOf(task) > -1) {
  nimblyci[task](...args).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.error(chalk`{red error} "${task || ''}" is not a valid task`);
  process.exit(1);
}
