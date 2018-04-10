var express = require('express');
var router = express.Router();
var controlOffering = require('../controllers/offerings');
var controlOther = require('../controllers/others');

/* Offerings Pages */
router.get('/', controlOffering.offeringList);
router.get('/offering', controlOffering.offeringDetail);
router.get('/offering/new', controlOffering.offeringNew);
router.get('/offering/accept', controlOffering.offeringAccept);
router.get('/offering/past', controlOffering.offeringPast);

router.get('/offering/question/new', controlOffering.questionNew);
router.get('/offering/bid', controlOffering.bidNew);

/* Other Pages */
router.get('/about', controlOther.about)

module.exports = router;