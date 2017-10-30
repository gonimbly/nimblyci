# NimblyCI
A simple tool for making deployments to Salesforce easier.

## Install
```bash
npm install @gonimbly/nimblyci
```

## Usage

### Deploy project
```bash
SF_LOGIN_URL=https://login.salesforce.com \
SF_USERNAME=<username> \
SF_PASSWORD=<password + security token> \
nimblyci deploy src
```

### Deploy project dependencies
Unmanaged packages may be published to npm for use in Salesforce org repos.
An example of such a package is the `examples/` directory.

For a Salesforce org example, see [apex-utility-belt/example](https://github.com/gonimbly/apex-utility-belt/tree/master/example)

```bash
SF_LOGIN_URL=https://login.salesforce.com \
SF_USERNAME=<username> \
SF_PASSWORD=<password + security token> \
npm run add-packages
```
