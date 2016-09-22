import _ from 'lodash';

export default class PieClientSideController{
  
  constructor(model, controllerMap){
    this._model = model;
    this._controllerMap = controllerMap;
  }

  model(ids, session, env){
    console.log(ids, session, env);

    let toData = (id) => {
      let model = _.find(this._model, {id: id });
      let componentName = (model && model.component) ? model.component.name : '?';
      return {
        id: id,
        componentName: componentName,
        model: model,
        session: _.find(session, {id: id})
      }
    };

    let toPromise = (data) => {
      let modelFn = this._controllerMap[data.componentName].model || (() => Promise.reject(new Error('cant find function for ' + data.componentName)));
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