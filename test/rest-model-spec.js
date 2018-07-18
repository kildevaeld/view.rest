const Model = require('@viewjs/models').Model,
    withRestModel = require('../lib/with-rest-model').withRestModel,
    sinon = require('sinon');


function request(req, data) {
    switch (req.method) {
        case "POST":
            data.id = "2";
            return data;
        case "GET":
            return {
                name: 'test 1',
                id: '1'
            };
        case "PUT":
            return data;
    }
}

describe('withRestModel', () => {

    it('isNew should be false', () => {
        const RestModel = withRestModel(Model, '/', {});

        const model = new RestModel();

        model.isNew.should.be.true();

    });

    it('isDirty should be false', () => {
        const RestModel = withRestModel(Model, '/', {});

        let model = new RestModel();

        model.isDirty.should.be.false();

        model = new RestModel({
            name: 'test'
        });

        model.isDirty.should.be.false();

    });

    it('isDirty should be true when updating a property ', () => {
        const RestModel = withRestModel(Model, '/', {});

        let model = new RestModel();

        model.set('name', 'test');
        model.isDirty.should.be.true();

    });

    it('should not call backend if new and empty', async () => {

        const cb = sinon.fake();

        const RestModel = withRestModel(Model, '/', {
            request: () => {
                return {
                    then: cb
                }
            }
        });

        let model = new RestModel();

        await model.save();
        cb.callCount.should.be.equal(0);

    });

    it('should not call backend if new and empty', async () => {

        const cb = sinon.fake();

        const RestModel = withRestModel(Model, '/', {
            request: () => {
                return {
                    then: cb
                }
            }
        });

        let model = new RestModel();

        await model.save();
        cb.callCount.should.be.equal(0);

    });


});