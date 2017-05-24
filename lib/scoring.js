import cloneDeep from 'lodash/cloneDeep';

const normalizeWeights = (config) => {

  const w = cloneDeep(config.weights || []);

  const withDefaults = config.models.reduce((acc, m) => {
    const customWeight = w.find(weight => weight.id === m.id);
    if (!customWeight) {
      acc.push({ id: m.id, weight: 1 });
    }
    return acc;
  }, w);

  const normalized = withDefaults.filter(dw => config.models.find(m => m.id === dw.id) !== undefined);
  return normalized;
}

/**
 * 
 * @param {{models: [], weights: []}} config 
 * @param {[ {id,...}, ....]} sessions 
 * @param {[{id, score, ... }]} outcomes 
 */
export default function score(config, sessions, outcomes) {

  return new Promise((resolve, reject) => {
    const weights = normalizeWeights(config);
    const max = weights.reduce((acc, w) => acc + w.weight, 0);
    const min = 0;
    const realScore = outcomes.reduce((acc, o) => {
      const weight = weights.find(w => w.id === o.id);
      return acc + (o.score * weight.weight);
    }, 0);
    const percentage = Math.floor((realScore / max) * 100);

    resolve({
      summary: { min, max, percentage },
      pies: cloneDeep(outcomes),
      weights
    });
  });

}