const express = require('express');
const router = express.Router();

router.get('/api', api_page);
module.exports = router;

function api_page (req, res) {

    res.render('api');

}