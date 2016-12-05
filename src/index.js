import connect from './connect';
import logger from './logger';

export default class NimblyCI {

  constructor(opts) {
    this.opts = opts;
  }

  connect() {
    const { loginUrl, username, password, securityToken, version } = this.opts;
    return connect({
      loginUrl,
      username,
      password: `${password}${securityToken}`,
      version,
      logger,
    }).then((conn) => {
      this.conn = conn;
      return conn;
    });
  }

  deploy() {}

  describeMetadata() {}

  listMetadata() {}

  packageXml() {}
}
