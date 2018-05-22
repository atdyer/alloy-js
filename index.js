const express = require('express');
const app = express();

const user = require('./routes/user');
const gist = require('./routes/gist');


app.use(express.static('public'));
app.use('/', user);
app.use('/', gist);
app.set('view engine', 'pug');

app.listen(3000, () => console.log('Example app listening on port 3000'));
