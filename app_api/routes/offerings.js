var express = require('express');
var router = express.Router();
var ctrlOfferings = require('../controllers/offerings');

router.get('/', ctrlOfferings.offerings);
router.get('/offering/:offeringid', ctrlOfferings.viewOffering);
router.post('/offering/new', ctrlOfferings.addOffering);
router.get('/offering/past', ctrlOfferings.offeringsPast);


router.post('/offering/:offeringid/question/add', ctrlOfferings.addQuestion);
router.put('/offering/:offeringid/question/:questionid', ctrlOfferings.answerQuestion);
router.post('/offering/:offeringid/bid/add', ctrlOfferings.addBid);
router.put('/offering/:offeringid/bid/accept', ctrlOfferings.acceptBid);


module.exports = router;