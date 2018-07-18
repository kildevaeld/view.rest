const Model = require('@viewjs/models').Model,
    ModelCollection = require('@viewjs/models').ModelCollection,
    withRestCollection = require('../lib/with-rest-collection').withRestCollection,
    sinon = require('sinon');

describe('withRestCollection', () => {

    it('', () => {

        const Collection = withRestCollection(ModelCollection);

        const col = new Collection();

    });

});