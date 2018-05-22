const license = require('node-opensource');


module.exports = {
    filter_license: filter_license,
    find_license: find_license
};


function filter_license (license) {
    let url = license.links.find(link => link.note === 'OSI Page');
    return {
        name: license.name,
        url: url ? url.url : license.links[0]
    };
}

function find_license (name) {
    return license.get(name);
}