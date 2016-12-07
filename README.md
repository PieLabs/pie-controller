# pie-controller

A controller for a [pie](http;//github.com/PieLabs) player.

It calls the underlying element-specific controller based on the `id` and `pie.name` in the data model.

## usage


```javascript
  
  import PieController from 'pie-controller';
  
  var controllerMap = {
    'pie-element' : pieElementController
  };

  var model = {
    pies: [
      { 
        id: '1', 
        element: 'pie-element'
      }
    ],
    langs: ['en-US'],
    weights: [{id: '1', weight: '1'}]
  }

  var controller = new PieController(model, controllerMap);
	
  /**
   * @param ids - an array of ids
   * @param sessions - an array of session data
   * @param env - the env 
   */
  controller.model(['1'], [{id: '1', ...}], {})
    .then((results) => {
      console.log(results);
    });
```

## Browser Integration

This package exports an `es6` module, if you want to use it in the browser you'll have to include it in a build tool like [webpack](http://webpack.github.io) and [babel](http://babel.github.io).

## Test

```shell
npm test 
```
