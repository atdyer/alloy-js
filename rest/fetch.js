const fetch = require('request-promise-native');
const yaml = require('js-yaml');


module.exports = {
    fetch_yaml: fetch_yaml
};


function fetch_yaml (url) {
    return fetch(url)
        .then(res => yaml.safeLoad(res));
}