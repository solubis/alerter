window.IQ_CONFIG = {
    'restURL': 'http://localhost:8083',
    'maxFileAttachmentSize': 104857600,
    'version': 'Testing Mockup'
};

function expectServerRequest(name, params) {
    jasmine.getJSONFixtures().fixturesPath = 'base/src/';

    inject(function ($httpBackend) {
        $httpBackend.whenGET(window.IQ_CONFIG.restURL + '/' + name + (params ? '?' + params : '')).respond(
            getJSONFixture('data/' + name + '.json')
        );
    });
}
