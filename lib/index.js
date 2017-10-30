import chalk from 'chalk';
import fs from 'fs-extra';
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
const appPkg = resolveApp('package.json');

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
    throw new Error(`${v} is not configured`);
  }
};

export const checkEnv = () => {
  check(SF_LOGIN_URL);
  check(SF_USERNAME);
  check(SF_PASSWORD);
};

const connection = (options = {}) => {
  const conn = new jsforce.Connection({
    loginUrl: process.env[SF_LOGIN_URL],
    version: apiVersion,
  });
  conn.metadata.pollTimeout = options.pollTimeout || POLL_TIMEOUT;
  conn.metadata.pollInterval = options.pollInterval || POLL_INTERVAL;
  return conn;
};

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
    archive.directory(dirpath, 'src');
    archive.finalize();
  } catch (err) {
    console.error(chalk`{red error} ${err}`);
  }

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

const completed = res => {
  job.doneStep(res == null);
  status.stop();
  console.log();
  // TODO Status reporting needs work
  // logReport(res);
  if (res != null) {
    throw res;
  }
};

export const deploy = async dirpath => {
  try {
    const conn = connection();
    await login(conn);
    pushStep(`Deploying project`);
    await _deploy(conn, resolveApp(dirpath));
    completed();
  } catch (err) {
    completed(err);
  }
};

const findPackage = name => {
  const root = path.resolve('/');
  let p = path.resolve('.');
  let res;
  while (res == null && p !== root) {
    const p2 = path.join(p, 'node_modules', name);
    if (fs.existsSync(p2)) {
      res = p2;
    } else {
      p = path.dirname(p);
    }
  }
  return res;
};

export const addPackages = async () => {
  try {
    const conn = connection();
    await login(conn);
    const { sfdcDependencies } = fs.readJsonSync(appPkg);
    for (const name of sfdcDependencies) {
      const p = findPackage(name);
      const pkg = fs.readJsonSync(`${p}/package.json`);
      pushStep(chalk.bold(`Deploying ${pkg.name}@${pkg.version}`));
      await _deploy(conn, path.join(p, 'src'));
    }
    completed();
  } catch (err) {
    completed(err);
  }
};
