const express = require('express');
const app = express();

const about = require('./routes/about');
const user = require('./routes/user');
const gist = require('./routes/gist');
const builder = require('./routes/builder');

if (process.env.NODE_ENV === 'dev') {
    console.log('IN DEV MODE: static contents of test/ directory available');
    app.use(express.static('test'));
}

app.use(express.static('public'));
app.get('/favicon.ico', (req, res) => res.status(204));
app.use('/', about);
app.use('/', builder);
app.use('/', user);
app.use('/', gist);
app.set('view engine', 'pug');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Example app listening on port ' + port));
