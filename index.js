const NimblyCI = require('./lib');

const ci = new NimblyCI({
  loginUrl: 'https://login.salesforce.com',
  username: 'jon.crenshaw+bamboo@gonimbly.com',
  password: 'xqCqY2YA',
  securityToken: 'J3n9Ts0bQI8j7Obh20STpublt',
  version: '36.0',
});

ci.connect();
