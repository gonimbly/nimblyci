import deploy from './deploy';

export default class NimblyCI {

  constructor(opts) {
    this.opts = opts;
  }

  deploy() {
    return deploy(this.opts);
  }
}
