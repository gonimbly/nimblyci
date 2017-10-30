import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import jsforce from 'jsforce';
import archiver from 'archiver';
import status from 'node-status';
import delay from 'delay';
// import promisify from 'promisify-node';
// import streamBuffers from 'stream-buffers';
// import glob from 'glob';
// import { logReport } from './report/DeployResult';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
// const appPkg = resolveApp('package.json');

const SF_LOGIN_URL = 'SF_LOGIN_URL';
const SF_USERNAME = 'SF_USERNAME';
const SF_PASSWORD = 'SF_PASSWORD';

const POLL_TIMEOUT = 60 * 1000;
const POLL_INTERVAL = 5 * 1000;

const apiVersion = process.env.SF_API_VERSION || '40.0';

const job = status.addItem('job', { steps: [] });

let started = false;

const pushStep = step => {
  job.steps.push(chalk.bold(step));
  if (!started) {
    console.log();
    started = true;
    status.start({
      interval: 80,
      pattern: '{spinner.cyan} {job.step}',
    });
  }
};

const check = v => {
  if (!process.env[v]) {
    throw new Error(
      `${v} is not configured. Check ${chalk.bold(chalk.cyan('.env.local'))}`
    );
  }
};

const checkEnv = () => {
  check(SF_LOGIN_URL);
  check(SF_USERNAME);
  check(SF_PASSWORD);
};

const connection = () =>
  new jsforce.Connection({
    loginUrl: process.env[SF_LOGIN_URL],
    version: apiVersion,
  });

const login = async conn => {
  const username = process.env[SF_USERNAME];
  const password = process.env[SF_PASSWORD];
  pushStep(`Logging in as ${username}`);
  const res = await conn.login(username, password);
  job.doneStep(true);
  return res;
};

const checkDeployStatus = async (conn, res) => {
  const status = await conn.metadata.checkDeployStatus(res.id, true);
  // TODO should rewrite reporters to use node-status
  // const deployResult = new DeployResult(status);
  // console.log(status);
  // const msg = deployResult.statusMessage();
  // if (msg) {
  //   logger.info(msg);
  // }
  return status;
};

const _deploy = async (conn, dirpath, options = {}) => {
  dirpath = resolveApp(dirpath);

  const archive = archiver('zip');
  try {
    archive.directory(dirpath, '');
    archive.finalize();
  } catch (err) {
    console.error(chalk`{red error} ${err}`);
  }

  pushStep(`Deploying to server`);
  conn.metadata.pollTimeout = options.pollTimeout || POLL_TIMEOUT;
  conn.metadata.pollInterval = options.pollInterval || POLL_INTERVAL;

  let res = await conn.metadata.deploy(archive, options);
  while (!res.done) {
    res = await checkDeployStatus(conn, res);
    if (!res.done) {
      await delay(conn.metadata.pollInterval);
    }
  }
  if (res.success) {
    job.doneStep(true);
    return res;
  }
  throw res;
};

const completed = (res, success) => {
  // console.log(res);
  job.doneStep(!success);
  status.stop();
  console.log();
  // TODO Status reporting needs work
  // logReport(res);
  throw res;
};

export const deploy = async dirpath => {
  try {
    checkEnv();
    const conn = connection();
    await login(conn);
    const res = await _deploy(conn, resolveApp(dirpath));
    completed(res, true);
  } catch (res) {
    completed(res, false);
  }
};
