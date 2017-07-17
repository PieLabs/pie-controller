import { assert, spy, stub } from 'sinon';

import chai from 'chai';
import proxyquire from 'proxyquire';

chai.should();

describe('pie-client-side-controller', () => {

  let model, controllerMap, controller, myPieController, Controller, outcomeResult;

  beforeEach((done) => {

    outcomeResult = {
      summary: { max: 1, min: 0, score: 1, percentage: 100 },
      pies: [
        { id: '1', score: 1.0 }
      ],
      weights: [
        { id: '1', weight: 1 }
      ]
    };

    Controller = proxyquire('../lib/index', {
      './scoring': {
        default: stub().returns(Promise.resolve(outcomeResult))
      }
    }).default;

    model = {
      langs: ['en-US'],
      models: [
        {
          id: '1',
          element: 'my-pie',
        },
        {
          id: '2',
          element: 'my-second-pie',
        }]
    };

    myPieController = {
      outcome: spy((model) => {
        return Promise.resolve({
          id: model.id,
          score: 1
        });
      }),
      model: spy((model) => {
        return Promise.resolve({
          id: model.id,
          value: 'model-response'
        });
      })
    }

    controllerMap = {
      'my-pie': myPieController,
      'my-second-pie': myPieController
    }

    controller = new Controller(model, controllerMap);
    done();
  });

  describe('getLanguages', () => {
    let langs;
    beforeEach((done) => {
      controller.getLanguages().then((l) => {
        langs = l;
        done();
      });
    });

    it('should return the intersection of the supported languages', function () {
      langs.should.eql(model.langs);
    });
  });

  describe('getLanguages with no langs in model', () => {
    beforeEach(() => {
      model = {
        models: [
          {
            id: '1',
            pie: {
              name: 'my-pie'
            }
          }]
      };

      controllerMap = {
        'my-pie': myPieController
      };

      controller = new Controller(model, controllerMap);
    });

    it('should return [] when langs is []', function (done) {
      controller.getLanguages().then((l) => {
        l.should.eql([]);
        done();
      });
    });
  });

  describe('outcome', () => {

    let outcomeResults;

    beforeEach((done) => {
      controller.outcome([{
        id: '1',
        value: 'session'
      }], {
          mode: 'gather'
        })
        .then((results) => {
          outcomeResults = results;
          done();
        })
        .catch(done);
    });

    it('should delegate calls to the underlying controllers', () => {
      assert.calledWith(myPieController.outcome, model.models[0], {
        id: '1',
        value: 'session'
      }, {
          mode: 'gather'
        });
    });

    it('should return the result in the promise', () => {
      outcomeResults.should.eql(outcomeResult)
    });
  });

  describe('model', () => {

    let modelResults;

    beforeEach((done) => {
      controller.model([{
        id: '1',
        value: 'session'
      }], {
          mode: 'gather'
        })
        .then((results) => {
          modelResults = results;
          done();
        })
        .catch(done);
    });

    it('should delegate calls to the underlying controllers', () => {
      assert.calledWith(myPieController.model, model.models[0], {
        id: '1',
        value: 'session'
      }, {
          mode: 'gather'
        });
    });

    it('should return the result in the promise', () => {
      modelResults.should.eql([{
        id: '1',
        element: 'my-pie',
        value: 'model-response'
      }, {
        id: '2',
        element: 'my-second-pie',
        value: 'model-response'
      }]);
    });
  });
});