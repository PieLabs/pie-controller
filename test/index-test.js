import chai from 'chai';
chai.should();

import { assert, stub, spy } from 'sinon';
import proxyquire from 'proxyquire';


describe('pie-client-side-controller', () => {

  let model, controllerMap, controller, myPieController, Controller, factory, processor;

  beforeEach((done) => {

    processor = {
      score: spy(function (session, outcomes) {
        return {
          session: session,
          outcomes: outcomes
        }
      })
    }

    factory = {
      getProcessor: stub().returns(processor)
    }

    Controller = proxyquire('../lib/index', {
      'pie-scoring': {
        default: stub().returns(factory)
      }
    }).default;

    model = {
      langs: ['en-US'],
      pies: [
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
          score: { scaled: 1 }
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
        pies: [
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
      assert.calledWith(myPieController.outcome, model.pies[0], {
        id: '1',
        value: 'session'
      }, {
          mode: 'gather'
        });
    });

    it('should return the result in the promise', () => {
      outcomeResults.should.eql({
        session: [{
          id: '1',
          value: 'session'
        }],
        outcomes: [
          {
            id: '1',
            score: {
              scaled: 1
            }
          },
          {
            id: '2',
            score: {
              scaled: 1
            }
          }
        ]
      });
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
      assert.calledWith(myPieController.model, model.pies[0], {
        id: '1',
        value: 'session'
      }, {
          mode: 'gather'
        });
    });

    it('should return the result in the promise', () => {
      modelResults.should.eql([{
        id: '1',
        value: 'model-response'
      }, {
        id: '2',
        value: 'model-response'
      }]);
    });
  });
});