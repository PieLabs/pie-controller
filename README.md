# pie-client-side-controller

A client side controller for a [pie](http;//github.com/PieLabs) player.

## usage


```javascript`
  
  import PieClientSideController from 'pie-client-side-controller';
  
  var controllerMap = {
    'pie-element' : pieElementController
  };

  var model = [];

  var controller = new PieClientSideController(model, controllerMap);

  controller.model([], [], {})
    .then((results) => {
      console.log(results);
    });
```

# Browser Integration

This package exports an `es6` module, so you'll have to include it in a build tool like [webpack](http://webpack.github.io) and [babel](http://babel.github.io).
