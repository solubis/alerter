exports.config = {
    specs: ['e2e/*.js'],
    capabilities: {
        browserName: 'chrome'
    },
    jasmineNodeOpts: {
        defaultTimeoutInterval: 1000000
    },
    baseUrl: 'http://localhost:3000/',
    framework: 'jasmine2'
};
