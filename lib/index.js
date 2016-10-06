import _ from 'lodash';

import ScoringProcessorFactory from 'pie-scoring';

export default class PieClientSideController{

  constructor(model, controllerMap){
    this._pies = model.pies;
    this._controllerMap = controllerMap;
    this._scoringProcessor = new ScoringProcessorFactory().getProcessor(model);
  }

  model(ids, session, env){
    return this._callComponentController('model', ids, session, env)
  }

  outcome(ids, session, env){
    return this._callComponentController('outcome', ids, session, env).then(
      (outcomes) => {
        return this._scoringProcessor.score(this._pies, session, outcomes);
      });
  }


  _callComponentController(fnName, ids, session, env){
    let toData = (id) => {
      let model = _.find(this._pies, {id: id});
      
      if(!model.pie){
        throw new Error('This model is missing a `pie`' + JSON.stringify(model));
      }

      return {
        id: id,
        pie: model.pie,
        model: model,
        session: _.find(session, {id: id})
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

    let promises = _(ids)
      .map(toData)
      .map(toPromise);

    return Promise.all(promises);
  }
}