import chai from 'chai';
chai.should();

import sinon from 'sinon';

import Controller from '../lib/index';

describe('model', () => {

  let model, controllerMap, controller, myPieController, modelResults;

  beforeEach((done) => {
    model = [
      {
        id: '1', component: {
          name: 'my-pie'
        }
      }
    ];

    myPieController = {
      model: sinon.spy((model) => {
        return Promise.resolve({ id: model.id, value: 'model-response' });
      })
    }

    controllerMap = {
      'my-pie': myPieController
    }

    controller = new Controller(model, controllerMap);

    controller.model(['1'], [{ id: '1', value: 'session' }], { mode: 'gather' })
      .then((results) => {
        modelResults = results;
        done();
      })
      .catch(done);
  });

  it('should delegate calls to the underlying controllers', () => {
    sinon.assert.calledWith(myPieController.model, model[0], { id: '1', value: 'session' }, { mode: 'gather' });
  });

  it('should return the result in the promise', () => {
    modelResults.should.eql([{ id: '1', value: 'model-response' }]);
  });
});
