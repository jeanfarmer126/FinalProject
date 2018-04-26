var request = require('request');
var apiOptions = {
  server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
  //apiOptions.server = "https://course-organizer.herokuapp.com";
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
    else if (!req.query.all) {
        for (var i = responseBody.length - 1; i >= 0; i--) {
            if (!responseBody[i].available) {
                responseBody.splice(i,1)
            }
        }
    }
  }
  res.render('offerings-list', { 
        title: 'Offerings',
        offerings:  responseBody,
        all: (req.query.all == 'true')
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
    else if (!req.query.all) {
      for (var i = responseBody.length - 1; i >= 0; i--) {
        if (responseBody[i].available) {
          responseBody.splice(i,1)
        }
      }
    }
  }
  res.render('past-offerings', { 
      title: 'Past Offerings',
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

module.exports.offeringListPrevious = function(req, res){
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
  res.render('offering-new-form', {title: 'New Offer'});
};

/* Page for adding a new question with fields */
module.exports.questionNew = function(req, res){
    res.render('offering-new-question', {title: 'New Question', offeringid: req.params.offeringid});
};

/* Page for adding a new bid with fields */
module.exports.bidNew = function(req, res){
    res.render('new-bid', {title: 'New Bid', offeringid: req.params.offeringid});
};

/* Page for accepting an offer (navigate by clicking button on offer detail page) */
module.exports.offeringAccept = function(req, res){
    res.render('accept-offering', {title: 'Accept Offer', offeringid: req.params.offeringid});
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
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
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
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
            console.log(body);
          res.redirect('/offering/' + offeringid + '?err=val');
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
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
            console.log(body);
          res.redirect('/offering/' + offeringid + '/bid?err=val');
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
  path = "/api/offering/new";
  postData = {
    playerName: req.body.playerName,
    itemYear: req.body.itemYear,
    signed: req.body.signed === '1',
    authentic: req.body.authentic === '1',
    gameWorn: req.body.gameWorn === '1',
    itemDescription: req.body.itemDescription,
    athleteInfo: req.body.athleteInfo,
    offererUser: req.body.offererUser,
    offererPass: req.body.offererPass
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "POST",
    json : postData
  };
  if (!postData.playerName || !postData.itemYear || !postData.itemDescription || !postData.athleteInfo || !postData.offererUser || !postData.offererPass) {
    res.redirect('/offering/new?err=val');
  }
  else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 201) {
          res.redirect('/');
        } else if (response.statusCode === 400 && body.playerName && body.playerName === "ValidationError" ) {
          console.log(body);
          res.redirect('/offering/new?err=val');
        } else {
          console.log(body);
        }
      }
    );
  }
}
