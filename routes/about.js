const express = require('express');
const router = express.Router();

router.get('/', about_page);
module.exports = router;

function about_page (req, res) {

    res.render('about');

}