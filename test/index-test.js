import chai from 'chai';
chai.should();

import sinon from 'sinon';

import Controller from '../lib/index';

describe('pie-client-side-controller', () => {

  let model, controllerMap, controller, myPieController;

  beforeEach((done) => {
    model = {
      pies: [
        {
          id: '1',
          pie: {
            name: 'my-pie',
            langs: ['en']
          }
        },
        {
          id: '2',
          pie: {
            name: 'my-second-pie',
            langs: ['es', 'en']
          }
        }]
    };

    myPieController = {
      getLanguages: () => {
        return ['en']
      },
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

    it('should return the intersection of the supported languages', function() {
      langs.should.eql(['en']);
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

    it('should return [] when langs is []', function(done) {
      model.pies[0].pie.langs = [];
      controller.getLanguages().then((l) => {
        l.should.eql([]);
        done();
      });
    });

    it('should return [] when langs is undefined', function(done) {
      model.pies[0].pie.langs = undefined;
      controller.getLanguages().then((l) => {
        l.should.eql([]);
        done();
      });
    });

    it('should return [] when langs is null', function(done) {
      model.pies[0].pie.langs = null;
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
          maxPoints: 2,
          points: 2,
          percentage: 100
        },
        components: [{
          id: '1',
          score: 1,
          weight: 1,
          weightedScore: 1
        }, {
          id: '2',
          score: 1,
          weight: 1,
          weightedScore: 1
        }]
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
      }, {
        id: '2',
        value: 'model-response'
      }]);
    });
  });
});