import _ from 'lodash';

export default class PieClientSideController{

  constructor(model, controllerMap, scoringProcessor){
    this._model = model;
    this._controllerMap = controllerMap;
    this._scoringProcessor = scoringProcessor;
  }

  model(ids, session, env){
    return this._callComponentController('model', ids, session, env)
  }

  outcome(ids, session, env){
    return this._callComponentController('outcome', ids, session, env).then(
      (outcome) => {
        if(this._scoringProcessor) {
          return this._scoringProcessor.score(this._model, session, outcome);
        } else {
          return outcome;
        }
      });
  }


  _callComponentController(fnName, ids, session, env){
    let toData = (id) => {
      let model = _.find(this._model, {id: id});
      
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