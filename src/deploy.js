import archiver from 'archiver';
import Promise from 'bluebird';
import DeployResult from './report/DeployResult';
import logger from './logger';

const POLL_TIMEOUT = 60 * 1000;
const POLL_INTERVAL = 5 * 1000;

const checkDeployStatus = (conn, res) => {
  return Promise.resolve(conn.metadata.checkDeployStatus(res.id, true))
    .then((res) => {
      const deployResult = new DeployResult(res);
      logger.info(res);
      const msg = deployResult.statusMessage();
      if (msg) {
        logger.info(msg);
      }
      return Promise.resolve(res);
    });
};

export default function deploy(conn, dirpath, options) {
  const archive = archiver('zip');
  archive.directory(dirpath, '');
  archive.finalize();

  logger.info('Deploying to server...');
  conn.metadata.pollTimeout = options.pollTimeout || POLL_TIMEOUT;
  conn.metadata.pollInterval = options.pollInterval || POLL_INTERVAL;

  const check = (res) => {
    if (!res.done) {
      return checkDeployStatus(conn, res).delay(conn.metadata.pollInterval).then(check);
    }
    if (res.success) {
      return Promise.resolve();
    }
    return Promise.reject();
  };
  return Promise.resolve(conn.metadata.deploy(archive, options)).then(check);
}
