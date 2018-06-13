const express = require('express');
const fetch = require('../rest/fetch');
const octo = require('../rest/octokit');
const router = express.Router();


router.get('/:user/:id', gist_page);
module.exports = router;


function gist_page (req, res) {

    console.log('Gist page request:', req.params.user + '/' + req.params.id);

    let user_promise = get_user(req.params.user);
    let gist_promise = get_gist(req.params.id)
        .then(get_dot_alloy)
        .then(get_license);

    Promise.all([user_promise, gist_promise])
        .then(function (results) {
            let data = results[1];
            let dot_alloy = data.dot_alloy;
            let gist = data.gist;
            let license = data.license;
            let user = results[0];

            let instance = dot_alloy.instance
                ? gist.files[dot_alloy.instance]
                    ? dot_alloy.instance
                    : null
                : gist.files['instance.xml']
                    ? 'instance.xml'
                    : null;

            res.render('gist', {
                dot_alloy: dot_alloy,
                gist: gist,
                instance: instance,
                license: license,
                user: user,
            });

        })
        .catch(function (error) {
            console.log('Error processing gist page.');
            console.log('\t' + error);
            console.log('\t' + req.params);
            res.render('error');
        });

}


function get_dot_alloy (data) {

    let dot_alloy = data.gist.files['.alloy']
        ? data.gist.files['.alloy'].raw_url
        : null;

    if (dot_alloy) {
        return fetch
            .fetch_yaml(dot_alloy)
            .then(dot_alloy => (data.dot_alloy = dot_alloy, data));
    }

    data.dot_alloy = {
        license: 'none'
    };

    return data;

}

function get_gist (id) {

    return octo.octokit
        .gists
        .get({id: id})
        .then(octo.print_requests_remaining)
        .then(result => result['data'])
        .then(octo.filter_gist_data)
        .then(gist => ({gist: gist}));

}

function get_license (data) {

    if (!data.dot_alloy) data.dot_alloy = {};
    if (!data.dot_alloy.license) data.dot_alloy.license = 'none';
    let lic = data.dot_alloy.license;

    if (lic !== 'none') {
        return octo
            .find_license(lic)
            .then(octo.filter_license)
            .then(lic => (data.license = lic, data));

    }

    data.license = 'none';
    return data;

}

function get_user (user) {

    console.log('Getting user');

    return octo.octokit
        .users
        .getForUser({username: user})
        .then(octo.print_requests_remaining)
        .then(result => result['data'])
        .then(octo.filter_user_data);

}