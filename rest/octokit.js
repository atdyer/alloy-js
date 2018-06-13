const octokit = require('@octokit/rest')();
const licenses = [];

octokit.authenticate({
    type: 'token',
    token: process.env.GITHUB_ACCESS_TOKEN
});

octokit.misc.getLicenses({})
    .then(({data, headers, status}) => {
        console.log('Fetching licenses...');
        Promise.all(data.map(fetch_license))
            .then(() => console.log('Fetched ' + licenses.length + ' licenses'))
            .catch(console.log);

    });

module.exports = {
    filter_alloy_gists: filter_alloy_gists,
    filter_file_data: filter_file_data,
    filter_gist_data: filter_gist_data,
    filter_license: filter_license,
    filter_user_data: filter_user_data,
    find_license: find_license,
    get_user_gists: get_user_gists,
    octokit: octokit,
    print_requests_remaining: print_requests_remaining,
    summarize_files: summarize_files,
    summarize_gists: summarize_gists
};


function get_user_gists (user) {
    return octokit
        .gists
        .getForUser({username: user})
        .then(result => result['data']);
}

function fetch_license (license) {
    return octokit.misc.getLicense({license: license.key})
        .then(({data, headers, status}) => {licenses.push(data)});
}

function filter_alloy_gists (gists) {
    return gists.filter(gist => !!gist.files['.alloy']);
}

function filter_file_data (file) {
    return {
        filename: file['filename'],
        language: file['language'],
        raw_url: file['raw_url']
    };
}

function filter_gist_data (gist) {
    return {
        id: gist['id'],
        description: gist['description'],
        created_at: gist['created_at'],
        updated_at: gist['updated_at'],
        files: summarize_files(gist['files'])
    };
}

function filter_license (license) {
    return {
        name: license.name,
        url: license.html_url
    }
}

function filter_user_data (user) {
    return {
        avatar: user['avatar_url'] + '&s=60',
        html_url: user['html_url'],
        login: user.login,
        name: user.name,
    }
}

function find_license (license) {
    return new Promise((res) => {
        res(licenses.find(l => l.key === license) || {
            name: license,
            html_url: 'https://opensource.org/licenses'
        });
    });
}

function print_requests_remaining (res) {
    let reset = new Date(parseInt(res.meta['x-ratelimit-reset']) * 1000);
    let remaining = res.meta['x-ratelimit-remaining'];
    let limit = res.meta['x-ratelimit-limit'];
    console.log(
        '\t' +
        remaining + '/' + limit +
        ' requests remaining. Reset at '
        + reset.toLocaleTimeString()
    );
    return res;
}

function summarize_files (files) {
    return Object.assign({}, ...Object.keys(files).map(key => ({
        [key]: filter_file_data(files[key])
    })));
}

function summarize_gists (gists) {
    return gists.map(filter_gist_data);
}