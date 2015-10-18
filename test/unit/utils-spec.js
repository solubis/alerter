describe('Utils Service', function () {

    beforeEach(module('modules.core'));

    beforeEach(function () {
        expectServerRequest('dictionaries');
    });

    it('arraySearch method', inject(function ($utils) {
        var array = [{code: 'aaa', name: 'bbb'}, {code: 'bbb', name: 'ccc'}];

        var elem = $utils.arraySearch(array, function (item) {
            return item.code === 'bbb';
        });

        expect(elem.name).toBe('ccc');

        elem = $utils.arraySearch(array, function (item) {
            return item.code === 'ddd';
        });

        expect(elem).toBeUndefined();

        elem = $utils.arraySearch(array, {code: 'bbb'});
        expect(elem.name).toBe('ccc');
    }));
});
