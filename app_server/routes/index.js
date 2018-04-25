var express = require('express');
var router = express.Router();
var controlOffering = require('../controllers/offerings');
var controlOther = require('../controllers/others');

/* Offerings Pages */
router.get('/', controlOffering.offeringList);
router.get('/offering/:offeringid', controlOffering.offeringDetail);
router.get('/offering/new', controlOffering.offeringNew);
router.get('/offering/:offeringid/accept', controlOffering.offeringAccept);
router.get('/offering/past', controlOffering.offeringPast);

router.get('/offering/:offeringid/question/new', controlOffering.questionNew);
router.post('/offering/:offeringid/question/new', controlOffering.addQuestion);
router.post('/offering/:offeringid/question/:questionid/answer', controlOffering.answerQuestion);
router.get('/offering/:offeringid/bid', controlOffering.bidNew);
router.post('/offering/:offeringid/bid', controlOffering.addBid);

/* Other Pages */
router.get('/about', controlOther.about)

module.exports = router;