const express = require('express');
const app = express();
const octokit = require('@octokit/rest')();
const licenses = require('node-opensource');
const fetch = require('request-promise-native');
const yaml = require('js-yaml');


app.use(express.static('public'));
app.set('view engine', 'pug');


app.get('/', get_gists);
app.get('/:user', user_page);
app.get('/:user/:id', gist_page);
app.get('/favicon.ico', (req, res) => res.status(204));
app.listen(3000, () => console.log('Example app listening on port 3000'));


octokit.authenticate({
    type: 'token',
    token: process.env.GITHUB_ACCESS_TOKEN
});



function gist_page (req, res) {

    console.log('Gist page request:', req.params.user, ':', req.params.id);

    let user_promise = get_user(req.params.user);
    let gist_promise = get_gist(req.params.id)
        .then(get_dot_alloy)
        .then(get_license);

    Promise.all([user_promise, gist_promise])
        .then(function (results) {
            let user = results[0];
            let gist = results[1];
            let license = gist['license'];

            delete gist['alloy'];
            delete gist['license'];

            res.render('gist', {
                user: user,
                gist: gist,
                license: license
            });

        })
        .catch(error);

}

function user_page (req, res) {

    console.log('User page request:', req.params.user);

    let user_promise = get_user(req.params.user);
    let gist_promise = get_gists(req.params.user);

    Promise.all([user_promise, gist_promise])
        .then(function (results) {
            let user = results[0];
            let gists = results[1];
            res.render('user', {
                user: user,
                gists: gists
            });
        })
        .catch(error);
}



function get_dot_alloy (gist) {
    gist.alloy = gist.files['.alloy'] ? gist.files['.alloy'].raw_url : null;
    if (gist.alloy) {
        return fetch(gist.alloy)
            .then(function (res) {
                gist.alloy = yaml.safeLoad(res);
                return gist;
            });
    }
    return gist;
}

function get_gist (sha) {

    return octokit
        .gists
        .get({id: sha})
        .then(print_requests_remaining)
        .then((result) => result['data'])
        .then(filter_gist_data);

}

function get_gists (user) {

    return octokit
        .gists
        .getForUser({username: user})
        .then(print_requests_remaining)
        .then((result) => result['data'])
        .then(filter_alloy_gists)
        .then(filter_gist_summaries);

}

function get_license (gist) {
    if (gist.alloy && gist.alloy.license) {
        return licenses.get(gist.alloy.license)
            .then(function (lic) {
                let url = lic.links.find(lnk => lnk.note === 'OSI Page');
                gist.license = {
                    name: lic.name,
                    url: url ? url.url : lic.links[0]
                };
                return gist;
            });
    }
    return gist;
}

function get_user (user) {

    return octokit
        .users
        .getForUser({username: user})
        .then(print_requests_remaining)
        .then((result) => result['data'])
        .then(filter_user_data);

}



function filter_alloy_gists (gists) {
    return gists.filter(gist => !!gist.files['.alloy']);
}

function filter_file_data (file) {
    return {
        filename: file['filename'],
        raw_url: file['raw_url']
    };
}

function filter_gist_data (gist) {
    return {
        id: gist['id'],
        description: gist['description'],
        created_at: gist['created_at'],
        updated_at: gist['updated_at'],
        files: filter_file_summaries(gist['files'])
    };
}

function filter_file_summaries (files) {
    return Object.assign({}, ...Object.keys(files).map(key => ({
        [key]: filter_file_data(files[key])
    })));
}

function filter_gist_summaries (gists) {
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
        login: user.login,
        name: user.name,
    }
}



function print_requests_remaining (res) {
    let reset = new Date(parseInt(res.meta['x-ratelimit-reset']) * 1000);
    let remaining = res.meta['x-ratelimit-remaining'];
    let limit = res.meta['x-ratelimit-limit'];
    console.log('\t' + remaining + '/' + limit + ' requests remaining. Reset at ' + reset.toLocaleTimeString());
    return res;
}

function error (err) {
    console.log('Uh oh....');
    console.log('\t' + err);
}