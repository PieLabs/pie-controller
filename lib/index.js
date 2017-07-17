import _ from 'lodash';
import score from './scoring';

export default class PieClientSideController {

  constructor(config, controllerMap) {

    if (!Array.isArray(config.models)) {
      throw new Error('config.models must be defined');
    }

    if (!controllerMap) {
      throw new Error('controllerMap must be defined');
    }

    this._config = config;
    this._controllerMap = controllerMap;
  }


  model(session, env) {
    return this._callComponentController('model', session, env)
  }

  /**
   * https://pielabs.github.io/pie-website/docs/using/pie-player-api/#outcome--promiseoutcome-optional 
   * @param {*} session 
   * @param {*} env 
   */
  outcome(session, env) {
    return this._callComponentController('outcome', session, env).then(
      (outcomes) => {
        return score(this._config, session, outcomes);
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
      const handler = this._controllerMap[data.element];

      let modelFn = (handler && handler[fnName]) ? handler[fnName] : () => {
        console.warn('missing function for: ', data.element, ' ', fnName);
        Promise.resolve({});
      }

      return modelFn(data.model, data.session, env)
        .then((result) => {
          result.id = data.id;
          result.element = data.element;
          return result;
        });
    };

    let promises = _(this._config.models)
      .map(toData)
      .map(toPromise)
      .value();

    return Promise.all(promises);
  }
}