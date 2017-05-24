import { assert, spy, stub } from 'sinon';

import chai from 'chai';
import proxyquire from 'proxyquire';

chai.should();

describe('scoring', () => {

  let score, config, sessions, outcomes;


  beforeEach(() => {
    score = require('../lib/scoring').default;

    config = {
      models: [
        { id: '1' }
      ]
    }

    sessions = [
      { id: '1', value: 'hi' }
    ];

    outcomes = [
      { id: '1', score: 1 }
    ]
  });

  it('returns a score', () => {

    return score(config, sessions, outcomes)
      .then(outcome => {
        outcome.should.eql({
          summary: {
            max: 1, min: 0, percentage: 100
          },
          pies: [{
            id: '1', score: 1
          }],
          weights: [
            { id: '1', weight: 1 }
          ]
        });
      });
  });

});