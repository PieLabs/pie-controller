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

  it('returns a score', () => score(config, sessions, outcomes)
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
    })
  );

  it('sets weight to 0 for non scoreable outcomes', () => score(config, sessions, [{ id: '1' }])
    .then(outcome => {
      outcome.should.eql({
        summary: {
          max: 0, min: 0, percentage: 0
        },
        pies: [
          { id: '1' }
        ],
        weights: [
          { id: '1', weight: 0 }
        ]
      })
    })
  );

  it('can work with scoreable and non scoreable', () => score({
    models: [
      { id: '1' },
      { id: '2' }
    ],
    weights: [
      { id: '2', weight: 10 }
    ]
  }
    , sessions, [{ id: '1' }, { id: '2', score: 1 }])
    .then(outcome => {
      outcome.should.eql({
        summary: {
          max: 10, min: 0, percentage: 100
        },
        pies: [
          { id: '1' }, { id: '2', score: 1 }
        ],
        weights: [
          { id: '2', weight: 10 },
          { id: '1', weight: 0 }
        ]
      })
    })
  );
});