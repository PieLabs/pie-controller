//This allows us to use es6 source from npm packages
require('babel-register')({
  ignore: /node_modules\/(?!pie-default-scoring-processor)/
});