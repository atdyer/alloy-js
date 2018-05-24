const express = require('express');
const app = express();

const about = require('./routes/about');
const user = require('./routes/user');
const gist = require('./routes/gist');


app.use(express.static('public'));
app.get('/favicon.ico', (req, res) => res.status(204));
app.use('/', about);
app.use('/', user);
app.use('/', gist);
app.set('view engine', 'pug');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Example app listening on port ' + port));
