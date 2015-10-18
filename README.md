# Alerter UI [![Build Status](http://wfp-ci/buildStatus/icon?job=sqr-ui-build)](http://wfp-ci/view/Build/job/sqr-ui-build/)

## Getting Started

To use this application clone or fork this repository from Gitlab

    $ git clone git@code.solubis.com:Alerter/ui.git alerter
    $ cd alerter

To install dependencies:

    $ npm install

To build development version:

    $ grunt develop

To run development server:

    $ grunt server

(If browser is not automatically openened then go to URL: http://localhost:3000/src/index.html)

** WARNING ** : You need to start OAUTH Server (https://code.solubis.com/alerter/security/tree/develop) and REST Server (https://code.solubis.com/Alerter/rest/tree/develop) before UI.

To develop solubisUI and/or solubis Security frameworks link their folders to `lib/ui` and/or `lib/core` respectively.

To build distribution version:

    $ grunt build

To build distribution version after modification to alerter UI and/or alerter Core:

    $ grunt complete

To run distribution version:

(If browser is not automatically openened then go to URL: http://localhost:3000/dist/index.html)

    $ grunt server:dist

To install webdriver for Protractor tests:

    $ npm run update-webdriver

To run E2E protractor tests:

    $ grunt e2e

To run Karma unit tests

    $ grunt unit

## Configuration file

You can configure various settings in Squeler using in window.solubis_CONFIG variable.
It can be set in script tag or loaded from external file named `config.js` in index.html (this is default behaviour)

The contents are:
```
window.solubis_CONFIG = {
    'version': '0.15.0-SNAPSHOT.6', // DO NOT CHANGE! it is changed during build
    'restURL': 'http://localhost:8083', // REST Server URL
    'loginURL': 'http;//wfp-ci/dev/security, // Login application index.html URL
    'publicKey': '-----BEGIN PUBLIC KEY----- ......', // Public key to verify token signature
    'maxFileAttachmentSize': 10485760 // maximum size for file attachments (should be coordinated with server settings)
};
```

## Dependencies

Alerter depends on following libraries:

- alerter UI Framework (https://code.solubis.com/alerter-components/ui/tree/develop)
- alerter Core Application and Framework (https://code.solubis.com/alerter-components/core/tree/develop/ui)

## Containerize installation

Build image:

    $ clean deploy -Pdock

Run containers:
Please refer to system's [README.md](https://code.solubis.com/Alerter/system/blob/master/README.md)

## Bugs and Issues (JIRA)

Have a bug or an issue? [Open a new issue](https://jira.solubis.com/browse/SQU)

## Changelog

Changelog (https://code.solubis.com/Alerter/ui/blob/develop/CHANGELOG.md)

## Copyright and License

Copyright 2015 IMPAQ
