var request = require('request');
var apiOptions = {
  server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
  apiOptions.server = "https://final-project-446.herokuapp.com";
}


var renderOfferingsPage = function(req, res, responseBody){
  var message;
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = [];
  } else {
    if (!responseBody.length) {
      message = "No offerings found";
    }
    else {
      for (var i = responseBody.length - 1; i >= 0; i--) {
            if (!req.query.all && !responseBody[i].available) {
                responseBody.splice(i,1)
            }
            else if (req.query.all && responseBody[i].available) {
                responseBody.splice(i,1)
            }
        }
    }
  }
  if (req.query.sortOfferer) {
    responseBody.sort(function(a,b) {
      if (!a.offererUser || !b.offererUser) {
        return 0;
      }
      var offererA = a.offererUser.toLowerCase();
      var offererB = b.offererUser.toLowerCase();
      return (offererA < offererB) ? -1 : (offererA > offererB) ? 1 : 0;
    });
  }
  if (req.query.sortDate) {
    responseBody.sort(function(a,b) {
      if (!a.created || !b.created) {
        return 0;
      }
      var dateA = new Date(a.created);
      var dateB = new Date(b.created);
      return (dateA < dateB) ? -1 : (dateA > dateB) ? 1 : 0;
    });
  }
  res.render('offerings-list', { 
        title: 'Offerings',
        offerings:  responseBody,
        all: (req.query.all == 'true'),
        sortOfferer: (req.query.sortOfferer == 'true'),
        sortDate: (req.query.sortDate == 'true')
    });
};

var renderPreviousOfferingsPage = function(req, res, responseBody){
  var message;
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = [];
  } else {
    if (!responseBody.length) {
      message = "No offerings found";
    }
    else {
      for (var i = responseBody.length - 1; i >= 0; i--) {
            if (!req.query.all && !responseBody[i].available) {
                responseBody.splice(i,1)
            }
            else if (req.query.all && responseBody[i].available) {
                responseBody.splice(i,1)
            }
        }
    }
  }
  res.render('past-offerings', { 
        title: 'Offerings',
        offerings:  responseBody,
        all: (req.query.all == 'true')
    });
};

/* GET 'home' page */
module.exports.offeringList = function(req, res){
  var requestOptions, path;
  path = '/api/';
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {},
    qs : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      var i, data;
      data = body;
      renderOfferingsPage(req, res, data);
    }
  );
};

module.exports.offeringPast = function(req, res){
  var requestOptions, path;
  path = '/api/';
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {},
    qs : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      var i, data;
      data = body;
      renderPreviousOfferingsPage(req, res, data);
    }
  );
};

var renderOfferingDetailPage = function(req, res, responseBody){
  var message;
  if (!(responseBody instanceof Object)) {
    message = "API lookup error";
    responseBody = {};
  }
  data = { 
    title: responseBody.playerName,
    offering:  responseBody,
    currentBid: null
  }
  if (responseBody.bids.length > 0) {
      data.currentBid = responseBody.bids[responseBody.bids.length - 1]
  }
  res.render('offerings-info', data);
};

/* Detailed page of a single offering with navigation to other pages */
module.exports.offeringDetail = function(req, res){
  var requestOptions, path;
  path = '/api/offering/' + req.params.offeringid;
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {},
    qs : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      var i, data;
      data = body;
      renderOfferingDetailPage(req, res, data);
    }
  );
};

/* Page for adding a new offering with fields */
module.exports.offeringNew = function(req, res){
  res.render('offering-new-form', {title: 'New Offer', error: req.query.err});
};

/* Page for adding a new question with fields */
module.exports.questionNew = function(req, res){
    res.render('offering-new-question', {title: 'New Question', offeringid: req.params.offeringid, error: req.query.err});
};

/* Page for adding a new bid with fields */
module.exports.bidNew = function(req, res){
    res.render('new-bid', {title: 'New Bid', offeringid: req.params.offeringid, error: req.query.err});
};

/* Page for accepting an offer (navigate by clicking button on offer detail page) */
var renderOfferingAcceptPage = function(req, res, responseBody){
  var message;
  if (!(responseBody instanceof Object)) {
    message = "API lookup error";
    responseBody = {};
  }
  data = { 
    title: 'Accept Offer',
    offeringid:  responseBody._id,
    currentBid: null,
    error: req.query.err
  }
  if (responseBody.bids.length > 0) {
      data.currentBid = responseBody.bids[responseBody.bids.length - 1].amount
  }
  else {
    res.redirect("/offering"+responseBody._id);
  }
  res.render('accept-offering', data);
}

module.exports.offeringAccept = function(req, res){
  var requestOptions, path;
  path = '/api/offering/' + req.params.offeringid;
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {},
    qs : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      var i, data;
      data = body;
      renderOfferingAcceptPage(req, res, data);
    }
  );
};


module.exports.addQuestion = function(req, res){
  var requestOptions, path, offeringid, postdata;
  offeringid = req.params.offeringid;
  path = "/api/offering/" + offeringid + '/question/add';
  postdata = {
    questionText: req.body.question,
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "POST",
    json : postdata
  };
  if (!postdata.questionText) {
    res.redirect('/offering/' + offeringid + '/question/new?err=val');
  }
  else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 201) {
          res.redirect('/offering/' + offeringid);
        } else if (response.statusCode === 400 && body.message && body.message === "ValidationError" ) {
            console.log(body);
          res.redirect('/offering/' + offeringid + '/question/new?err=val');
        } else {
          console.log(body);
          //_showError(req, res, response.statusCode);
        }
      }
    );
  }
};

module.exports.answerQuestion = function(req, res){
  var requestOptions, path, offeringid, questionid, postdata;
  offeringid = req.params.offeringid;
  questionid = req.params.questionid; 
  path = "/api/offering/" + offeringid + '/question/' + questionid;
  postdata = {
    answer: req.body.answer,
    offerName: req.body.offerName
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "PUT",
    json : postdata
  };
  if (!postdata.answer) {
    res.redirect('/offering/' + offeringid + '?err=val');
  }
  else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 200) {
          res.redirect('/offering/' + offeringid);
        } else if (response.statusCode === 400 && body.message && body.message === "AuthenticationFailed") {
            console.log(body);
            res.redirect('/offering/' + offeringid + '?err=auth');
        } else {
          console.log(body);
          //_showError(req, res, response.statusCode);
        }
      }
    );
  }
};

module.exports.addBid = function(req, res){
  var requestOptions, path, offeringid, postdata;
  offeringid = req.params.offeringid;
  path = "/api/offering/" + offeringid + '/bid/add';
  postdata = {
    amount: req.body.amount,
    username: req.body.name,
    userpassword: req.body.password
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "POST",
    json : postdata
  };
  if (!postdata.amount || !postdata.username || !postdata.userpassword) {
    res.redirect('/offering/' + offeringid + '/bid?err=val');
  }
  else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 201) {
          res.redirect('/offering/' + offeringid);
        } else if (response.statusCode === 400 && body.message && body.message === "AuthenticationError" ) {
            console.log(body);
          res.redirect('/offering/' + offeringid + '/bid?err=auth');
        } else if (response.statusCode === 400 && body.message && body.message === "ValidationError" ) {
            console.log(body);
          res.redirect('/offering/' + offeringid + '/bid?err=val');
        } else if (response.statusCode === 400 && body.message && body.message === "BidAmountError" ) {
            console.log(body);
          res.redirect('/offering/' + offeringid + '/bid?err=amount');
        } else {
          console.log(body);
          //_showError(req, res, response.statusCode);
        }
      }
    );
  }
};

module.exports.doAcceptBid = function(req, res){
  var requestOptions, path, offeringid, postdata;
  offeringid = req.params.offeringid;
  path = "/api/offering/" + offeringid + '/bid/accept';
  postdata = {
    username: req.body.name,
    password: req.body.password
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "PUT",
    json : postdata
  };
  if (!postdata.username || !postdata.password) {
    res.redirect('/offering/' + offeringid + '/accept?err=val');
  }
  else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 200) {
          res.redirect('/offering/' + offeringid);
        } else if (response.statusCode === 400 && body.message && body.message === "AuthenticationError" ) {
          res.redirect('/offering/' + offeringid + '/accept?err=auth');
        } else {
          console.log(body);
          //_showError(req, res, response.statusCode);
        }
      }
    );
  }
};

module.exports.addOffering = function(req, res) {
  var requestOptions;
  var path;
  var postData;
  var today = new Date();
  path = "/api/offering/new";
  postData = {
    playerName: req.body.playerName,
    itemYear: req.body.itemYear,
    signed: req.body.signed === 'on',
    authentic: req.body.authentic === 'on',
    gameWorn: req.body.gameWorn === 'on',
    itemDescription: req.body.itemDescription,
    athleteInfo: req.body.athleteInfo,
    offererUser: req.body.offererUser,
    offererPass: req.body.offererPass,
    created: today,
    available: true
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "POST",
    json : postData
  };
  if (!postData.playerName || !postData.itemYear 
      || !postData.itemDescription || !postData.athleteInfo 
      || !postData.offererUser || !postData.offererPass
      || !postData.created) {
    res.redirect('/offering/new?err=val');
  }
  else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 201) {
          res.redirect('/');
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
          console.log(body);
          res.redirect('/offering/new?err=val');
        } else if (response.statusCode === 400 && body.playerName && body.playerName === "AuthenticationError" ) {
          console.log(body);
          res.redirect('/offering/new?err=auth');
        } else {
          console.log(body);
        }
      }
    );
  }
}
