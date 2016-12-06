import connect from './connect';
import deploy from './deploy';
import logger from './logger';
// import DeployResult from './report/DeployResult';

export default {

  connect(opts) {
    return connect(opts);
  },

  deploy(dirpath, opts) {
    return connect(opts).then((conn) => {
      return deploy(conn, dirpath, opts.deployOptions);
    }).then((res) => {
      logger.log(res);
      // DeployResult.logReport(res);
    });
  },
};
