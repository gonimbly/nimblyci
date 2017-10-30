# My Example Apex Package
An example package with a single Apex class. Replace `aub-example`
with your package's name.

## Install
In the directory containing your project's `src` directory, run:

```bash
npm install @gonimbly/nimblyci aub-example
```

Then add to `sfdcDependencies` in `package.json`, eg:

```json
"scripts": {
  "deploy": "nimblyci deploy src",
  "test": "nimblyci test src",
  "add-packages": "nimblyci add-packages"
},
"dependencies": {
  "@gonimbly/nimblyci": "0.0.6",
  "aub-example": "1.0.0"
},
"sfdcDependencies": ["aub-example"]
```

## Deployment
In your project, the script `add-packages` will deploy all
packages listed by `sfdcDependencies`:

```bash
SF_LOGIN_URL=https://login.salesforce.com \
SF_USERNAME=<username> \
SF_PASSWORD=<password + security token> \
npm run add-packages
```
