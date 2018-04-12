# Portal

Frontend Administration based on Angular admin dashboard framework (ng2-admin) [http://akveo.com/ng2-admin]()

[![Build Status](https://travis-ci.org/DigitalState/Portal.svg?branch=develop)](https://travis-ci.org/DigitalState/Portal)
[![Coverage Status](https://coveralls.io/repos/github/DigitalState/Portal/badge.svg?branch=develop)](https://coveralls.io/github/DigitalState/Portal?branch=develop)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/DigitalState/Portal/badges/quality-score.png?b=develop)](https://scrutinizer-ci.com/g/DigitalState/Portal/?branch=develop)


### Requirements

Refer to *ng2-admin* Documentation and Installation Guide: https://akveo.github.io/ng2-admin/


### Development
Run DEV mode from the `ng2-admin` directory:

```
npm start
```

Then point your browser to:
```
http://localhost:2999/
```

While in DEV mode, all updates to (*.ts, *.scss, etc..) files under the `src` directory will cause Webpack Dev Server to compile the changes and reload the app.


### Production
Compile PROD distribution from the `ng2-admin` directory:

```
npm run build:prod
```

The `build:prod` command erases the contents of the `dist` directory and compiles the newly built app in there.


### Common UI

UI components and services that are shared between SPAs are pulled from https://github.com/DigitalState/Ui as a Subtree under `ng2-admin/src/app/shared` directory.
