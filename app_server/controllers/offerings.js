/* Landing page with a list of offerings (sortable) */
module.exports.offeringList = function(req, res){
    res.render('offerings-list', {title: 'Offerings'});
};

/* Detailed page of a single offering with navigation to other pages */
module.exports.offeringDetail = function(req, res){
    res.render('offerings-info', {title: 'Offer Detail'});
};

/* Page for adding a new offering with fields */
module.exports.offeringNew = function(req, res){
    res.render('offering-new-form', {title: 'New Offer'});
};

/* Page for adding a new question with fields */
module.exports.questionNew = function(req, res){
    res.render('offering-new-question', {title: 'New Question'});
};

/* Page for adding a new bid with fields */
module.exports.bidNew = function(req, res){
    res.render('new-bid', {title: 'New Bid'});
};

/* Page for accepting an offer (navigate by clicking button on offer detail page) */
module.exports.offeringAccept = function(req, res){
    res.render('accept-offering', {title: 'Accept Offer'});
};

/* Page for sortable offers from the past (pretty much the same page as the landing page) */
module.exports.offeringPast = function(req, res){
    res.render('past-offerings', {title: 'Past Offers'});
};