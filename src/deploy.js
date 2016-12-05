import Promise from 'bluebird';

export default function (opts) {
  return new Promise((resolve) => {
    return resolve(opts);
  });
}
