import chai from 'chai';
chai.should();

import sinon from 'sinon';

import Controller from '../lib/index';

describe('pie-client-side-controller', () => {

  let model, controllerMap, controller, myPieController, scoringProcessor;

  beforeEach((done) => {
    model = {
      pies: [{
        id: '1',
        pie: {
          name: 'my-pie'
        }
      }]
    };

    myPieController = {
      outcome: sinon.spy((model) => {
        return Promise.resolve({
          id: model.id,
          score: {scaled: 1}
        });
      }),
      model: sinon.spy((model) => {
        return Promise.resolve({
          id: model.id,
          value: 'model-response'
        });
      })
    }

    controllerMap = {
      'my-pie': myPieController
    }

    controller = new Controller(model, controllerMap);
    done();
  });

  describe('outcome', () => {

    let outcomeResults;

    beforeEach((done) => {
      controller.outcome(['1'], [{
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
      sinon.assert.calledWith(myPieController.outcome, model.pies[0], {
        id: '1',
        value: 'session'
      }, {
        mode: 'gather'
      });
    });

    it('should return the result in the promise', () => {
      outcomeResults.should.eql({
        summary: {
          maxPoints: 1,
          points: 1,
          percentage: 100
        },
        components:[{
          id: '1',
          score: 1,
          weight: 1,
          weightedScore: 1
        }]});
    });
  });

  describe('model', () => {

    let modelResults;

    beforeEach((done) => {
      controller.model(['1'], [{
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
      sinon.assert.calledWith(myPieController.model, model.pies[0], {
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
      }]);
    });
  });
});