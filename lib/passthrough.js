/**
 * A controller compliant api, that just passes the model back. 
 * @param {*} model 
 */

export function model(model) {
  return Promise.resolve(model);
}

/**
 * A controller compliant api that returns the id and score of null. 
 * @param {*} model 
 */
export function outcome(model) {
  return Promise.resolve({ id: model.id, score: null });
}