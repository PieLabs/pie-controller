import _ from 'lodash';

import ScoringProcessorFactory from 'pie-scoring';

export default class PieClientSideController{

  constructor(model, controllerMap){
    this._pies = model.pies;
    this._controllerMap = controllerMap;
    this._scoringProcessor = new ScoringProcessorFactory().getProcessor(model);
  }

  model(session, env){
    return this._callComponentController('model', session, env)
  }

  outcome(session, env){
    return this._callComponentController('outcome', session, env).then(
      (outcomes) => {
        return this._scoringProcessor.score(session, outcomes);
      });
  }


  _callComponentController(fnName, session, env){
    let toData = (model) => {

      if(!model.pie){
        throw new Error('This model is missing a `pie`' + JSON.stringify(model));
      }

      return {
        id: model.id,
        pie: model.pie,
        model: model,
        session: _.find(session, {id: model.id})
      }
    };

    let toPromise = (data) => {
      let modelFn = this._controllerMap[data.pie.name][fnName] || (() => Promise.reject(new Error('cant find function for ' + data.pie.name)));
      return modelFn(data.model, data.session, env)
        .then((result) => {
          result.id = data.id;
          return result;
        });
    };

    let promises = _(this._pies)
      .map(toData)
      .map(toPromise);

    return Promise.all(promises);
  }
}