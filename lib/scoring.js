import cloneDeep from 'lodash/cloneDeep';

const normalizeWeights = (config, outcomes) => {

  const w = cloneDeep(config.weights || []);

  const withDefaults = config.models.reduce((acc, m) => {
    const customWeight = w.find(weight => weight.id === m.id);
    const outcome = outcomes.find(o => o.id === m.id) || { id: m.id }
    if (outcome.score === null || outcome.score === undefined) {
      acc.push({ id: m.id, weight: 0 })
    } else if (!customWeight) {
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
    const weights = normalizeWeights(config, outcomes);
    const max = weights.reduce((acc, w) => acc + w.weight, 0);
    const min = 0;
    const realScore = outcomes.reduce((acc, o) => {
      const weight = weights.find(w => w.id === o.id);
      const weightedScore = (o.score || 0) * weight.weight;
      return acc + weightedScore;
    }, 0);
    const percentage = (realScore <= 0 || max <= 0) ? 0 : Math.floor((realScore / max) * 100);

    resolve({
      summary: { min, max, percentage },
      pies: cloneDeep(outcomes),
      weights
    });
  });

}