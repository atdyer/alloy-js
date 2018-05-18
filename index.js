const express = require('express');
const app = express();
const octokit = require('@octokit/rest')();

app.use(express.static('public'));
app.set('view engine', 'pug');

app.get('/', get_gists);
app.get('/:user', user_page);
app.get('/:user/:gist_id', (req, res) => res.send(req.params));
app.listen(3000, () => console.log('Example app listening on port 3000'));


function user_page (req, res) {

    let user_promise = get_user(req.params.user);
    let gist_promise = get_gists(req.params.user);

    Promise.all([user_promise, gist_promise])
        .then(function (results) {
            let user = results[0];
            let gists = results[1];
            res.render('user', {
                user: user,
                gists: gists
            })
            // res.send({
            //     user: results[0],
            //     gists: results[1]
            // });
        })
        .catch(error);

    // res.render('user', {
    //     name: 'Tristan Dyer',
    //     html_url: 'https://github.com/atdyer',
    //     last_update: 'February 22, 2017',
    //     avatar: 'https://avatars0.githubusercontent.com/u/4733059?v=4&s=60'
    // });
}

function get_gists (user) {

    return octokit
        .gists
        .getForUser({username: user})
        .then((result) => result['data'])
        .then(filter_alloy_gists)
        .then(filter_gist_data);

}

function get_user (user) {

    return octokit
        .users
        .getForUser({username: user})
        .then((result) => result['data'])
        .then(filter_user_data);

}

function filter_alloy_gists (gists) {
    return gists.filter(gist => !!gist.files['.alloy']);
}

function filter_gist_data (gists) {
    return gists.map(gist => {
        return {
            id: gist['id'],
            description: gist['description'],
            created_at: gist['created_at'],
            updated_at: gist['updated_at']
        }
    });
}

function filter_user_data (user) {
    return {
        avatar: user['avatar_url'] + '&s=60',
        html_url: user['html_url'],
        name: user.name,
    }
}

function error () {
    console.log('Uh oh.');
}