var proxy = require('express-http-proxy');
var app = require('express')();

app.use('/', proxy('http://api.worldbank.org',{
  userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
    // console.log(userReq.url, proxyResData.toString());
    return proxyResData
  }}));

app.listen(8000)