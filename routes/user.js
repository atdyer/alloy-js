const express = require('express');
const octo = require('../rest/octokit');
const router = express.Router();


router.get('/:user', user_page);
module.exports = router;


function user_page (req, res) {

    console.log('User page request:', req.params.user);

    let user_promise = get_user(req.params.user);
    let gist_promise = get_user_gists(req.params.user);

    Promise.all([user_promise, gist_promise])
        .then(function (results) {
            let user = results[0];
            let gists = results[1];
            res.render('user', {
                user: user,
                gists: gists
            });
        })
        .catch(function (error) {
            console.log('Error processing user page.');
            console.log('\t' + error);
            console.log('\t' + req.params);
            res.render('error');
        });
}

function get_user (user) {

    return octo.octokit
        .users
        .getForUser({username: user})
        .then(octo.print_requests_remaining)
        .then(result => result['data'])
        .then(octo.filter_user_data);

}

function get_user_gists (user) {

    return octo.octokit
        .gists
        .getForUser({username: user})
        .then(octo.print_requests_remaining)
        .then(result => result['data'])
        .then(octo.filter_alloy_gists)
        .then(octo.summarize_gists);

}