const express = require('express');
const app = express();

const about = require('./routes/about');
const user = require('./routes/user');
const gist = require('./routes/gist');


app.use(express.static('public'));
app.use('/', about);
app.use('/', user);
app.use('/', gist);
app.set('view engine', 'pug');

app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000'));
