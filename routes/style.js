const express = require('express');
const router = express.Router();

router.get('/style', style_page);
module.exports = router;

function style_page (req, res) {

    res.render('style');

}