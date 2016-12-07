import _ from 'lodash';

import Factory from 'pie-scoring';

export default class PieClientSideController {

  constructor(config, controllerMap) {

    if (!Array.isArray(config.pies)) {
      throw new Error('config.pies must be defined');
    }

    if (!controllerMap) {
      throw new Error('controllerMap must be defined');
    }

    this._config = config;
    this._controllerMap = controllerMap;
    this._processor = new Factory().getProcessor(this._config);
  }

  get _pies() {
    return this._config.pies;
  }

  model(session, env) {
    return this._callComponentController('model', session, env)
  }

  outcome(session, env) {
    return this._callComponentController('outcome', session, env).then(
      (outcomes) => {
        return this._processor.score(session, outcomes);
      });
  }

  getLanguages() {
    if (Array.isArray(this._config.langs)) {
      return Promise.resolve(this._config.langs);
    } else {
      return Promise.resolve([]);
    }
  }

  _callComponentController(fnName, session, env) {
    let toData = (model) => {

      if (!model.element || !model.id) {
        throw new Error(`This model is missing either an 'element' or 'id' property: ${JSON.stringify(model)}`);
      }

      return {
        id: model.id,
        element: model.element,
        model: model,
        session: _.find(session, { id: model.id })
      }
    };

    let toPromise = (data) => {
      let failed = () => Promise.reject(new Error(`Can't find function for ${data.element}`));
      let modelFn = this._controllerMap[data.element][fnName] || failed;
      return modelFn(data.model, data.session, env)
        .then((result) => {
          result.id = data.id;
          return result;
        });
    };

    let promises = _(this._pies)
      .map(toData)
      .map(toPromise)
      .value();

    return Promise.all(promises);
  }
}