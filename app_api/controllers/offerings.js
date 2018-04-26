var mongoose = require('mongoose');
var offering = mongoose.model('Offering');
var question = mongoose.model('Question');
var bid = mongoose.model('Bid');

var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.offerings = function (req, res) {
    offering
        .find({}, '-questions -bids', function (err, docs) {
            if (!docs) {
              sendJsonResponse(res, 404, {
                 "message": "offerings not found"
              });
              return;
            }
            else if (err) {
              sendJsonResponse(res, 404, err);
              return;
            }
            offerings = buildOfferingList(req, res, docs);
            sendJsonResponse(res, 200, offerings);
        });
};

module.exports.offeringsPast = function (req, res) {
    offering
        .find({}, '-questions -bids', function (err, docs) {
            if (!docs) {
              sendJsonResponse(res, 404, {
                 "message": "offerings not found"
              });
              return;
            }
            else if (err) {
              sendJsonResponse(res, 404, err);
              return;
            }
            offerings = buildOfferingList(req, res, docs);
            sendJsonResponse(res, 200, offerings);
        });
};

var buildOfferingList = function(req, res, results) {
  var offerings = [];
  results.forEach(function(doc) {
    offerings.push({
      playerName: doc.playerName,
      itemYear: doc.itemYear,
      signed: doc.signed,
      authentic: doc.authentic,
      gameWorn: doc.gameWorn,
      itemDescription: doc.itemDescription,
      athleteInfo: doc.athleteInfo,
      offererUser: doc.offererUser,
      offererPass: doc.offererPass,
      _id: doc._id
    });
  });
  return offerings;
};

module.exports.addOffering = function (req, res) {
  offering.create({
    playerName: req.body.playerName,
    itemYear: req.body.itemYear,
    signed: req.body.signed === '1',
    authentic: req.body.authentic === '1',
    gameWorn: req.body.gameWorn === '1',
    itemDescription: req.body.itemDescription,
    athleteInfo: req.body.athleteInfo,
    offererUser: req.body.offererUser,
    offererPass: req.body.offererPass
  }, function(err, offering) {
    if (err) {
      console.log(err);
      console.log(offering);
      sendJsonResponse(res, 400, err);
    } else {
      sendJsonResponse(res, 201, offering);
    }
  });
};

module.exports.viewOffering = function (req, res) {
    if (req.params && req.params.offeringid) {
        offering
            .findById(req.params.offeringid)
            .exec(function(err, offering) {
                if (!offering) {
                  sendJsonResponse(res, 404, {
                     "message": "offeringid not found"
                  });
                  return;
                }
                else if (err) {
                  sendJsonResponse(res, 404, err);
                  return;
                }
                sendJsonResponse(res, 200, offering);
            });
    }
    else {
        sendJsonResponse(res, 404, {
          "message": "No offeringid in request"
        });
    }
};

module.exports.addQuestion = function (req, res) {
  if (req.params.offeringid) {
    offering
      .findById(req.params.offeringid)
      .select('questions')
      .exec(
        function(err, offering) {
          if (err) {
            sendJsonResponse(res, 400, err);
          } else {
            doAddQuestion(req, res, offering);
          }
        }
    );
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found, offeringid required"
    });
  }
};

var doAddQuestion = function(req, res, offering) {
  if (!offering) {
    sendJsonResponse(res, 404, "offeringid not found");
  } else {
    newQuestion = question.create({
      questionText: req.body.questionText,
      created: new Date()
    }, function(err, question) {
        offering.questions.push(question);
         offering.save(function(err, offering) {
            var thisQuestion;
            if (err) {
              sendJsonResponse(res, 400, err);
            } else {
              thisQuestion = offering.questions[offering.questions.length - 1];
              sendJsonResponse(res, 201, thisQuestion);
            }
          });
    });
  }
};

module.exports.addBid = function (req, res) {
  if (req.params.offeringid) {
    offering
      .findById(req.params.offeringid)
      .select('bids')
      .exec(
        function(err, offering) {
          if (err) {
            sendJsonResponse(res, 400, err);
          } else {
            doAddBid(req, res, offering);
          }
        }
    );
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found, offeringid required"
    });
  }
};

var doAddBid = function(req, res, offering) {
  if (!offering) {
    sendJsonResponse(res, 404, "offeringid not found");
  } else {
    newBid = bid.create({
      username: req.body.username,
      userpassword: req.body.userpassword,
      amount: req.body.amount,
      created: new Date()
    }, function(err, bid) {
        offering.bids.push(bid);
         offering.save(function(err, offering) {
            var thisBid;
            if (err) {
              sendJsonResponse(res, 400, err);
            } else {
              thisBid = offering.bids[offering.bids.length - 1];
              sendJsonResponse(res, 201, thisBid);
            }
          });
    });
  }
};

module.exports.answerQuestion = function (req, res) {
  if (!req.params.offeringid || !req.params.questionid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, offeringid and questionid are both required"
    });
    return;
  }
  offering
    .findById(req.params.offeringid)
    .select('questions')
    .exec(
      function(err, offering) {
        var thisQuestion;
        if (!offering) {
          sendJsonResponse(res, 404, {
            "message": "offeringid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }
        if (offering.questions && offering.questions.length > 0) {
          thisQuestion = offering.questions.id(req.params.questionid);
          if (!thisQuestion) {
            sendJsonResponse(res, 404, {
              "message": "questionid not found"
            });
          } else {
            thisQuestion.answer = req.body.answer;
            offering.save(function(err, offering) {
              if (err) {
                sendJsonResponse(res, 404, err);
              } else {
                sendJsonResponse(res, 200, thisQuestion);
              }
            });
          }
        } else {
          sendJsonResponse(res, 404, {
            "message": "No question to update"
          });
        }
      }
  );
};

module.exports.acceptBid = function (req, res) {
if (!req.params.offeringid || !req.params.bidid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, offeringid and bidid are both required"
    });
    return;
  }
  offering
    .findById(req.params.offeringid)
    .select('bids')
    .exec(
      function(err, offering) {
        var thisBid;
        if (!offering) {
          sendJsonResponse(res, 404, {
            "message": "offeringid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }
        if (offering.bids && offering.bids.length > 0) {
          thisBid = offering.bids.id(req.params.bidid);
          if (!thisBid) {
            sendJsonResponse(res, 404, {
              "message": "bidid not found"
            });
          } else {
            thisBid.accepted = true;
            offering.available = false;
            offering.save(function(err, offering) {
              if (err) {
                sendJsonResponse(res, 404, err);
              } else {
                sendJsonResponse(res, 200, thisBid);
              }
            });
          }
        } else {
          sendJsonResponse(res, 404, {
            "message": "No bid to accept"
          });
        }
      }
  );
};

