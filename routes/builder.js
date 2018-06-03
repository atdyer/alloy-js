const express = require('express');
const router = express.Router();

router.get('/builder', builder_page);
module.exports = router;

function builder_page (req, res) {

    res.render('builder');

}