var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname));
app.set('views', __dirname);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());



app.get('*', function(req, res){
  res.render('index.html');
});

app.listen(app.get('port'), function() {
  console.log('Example app listening on port ' + app.get('port'))
});
