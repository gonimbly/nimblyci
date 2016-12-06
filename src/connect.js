import _ from 'lodash';
import Promise from 'bluebird';
import jsforce from 'jsforce';
import logger from './logger';

const CONFIG_PROPS = [
  'loginUrl',
  'accessToken',
  'instanceUrl',
  'refreshToken',
  'clientId',
  'clientSecret',
  'redirectUri',
  'logLevel',
  'version',
];

let conn;

export default function connect(opts = {}) {
  if (conn) {
    return Promise.resolve(conn);
  }
  if (!opts.username || !opts.password) {
    throw Error('Must specify "username" and "password" in options');
  }
  const config = _.pick(opts, CONFIG_PROPS);
  conn = new jsforce.Connection(config);
  return conn.login(opts.username, opts.password).then(() => {
    return conn.identity().then((identity) => {
      logger.log(`Logged in as ${identity.username}`);
      return conn;
    });
  });
}
