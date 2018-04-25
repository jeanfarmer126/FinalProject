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
      message = "No courses found";
    }
  }
  res.render('offerings-list', { 
        title: 'Offerings',
        offerings:  responseBody
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

var renderOfferingDetailPage = function(req, res, responseBody){
  var message;
  if (!(responseBody instanceof Object)) {
    message = "API lookup error";
    responseBody = {};
  }
  res.render('offerings-info', { 
        title: responseBody.playerName,
        offering:  responseBody,
        currentBid: responseBody.bids[responseBody.bids.length - 1]
    });
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

/* Page for sortable offers from the past (pretty much the same page as the landing page) */
module.exports.offeringPast = function(req, res){
    res.render('past-offerings', {title: 'Past Offers'});
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


/*
var renderCoursePage = function(req, res, responseBody) {
    var message;
      if (!(responseBody instanceof Object)) {
        message = "API lookup error";
        responseBody = {};
      }
      for (var i = responseBody.assignments.length - 1; i >= 0; i--) {
          responseBody.assignments[i].due = formatDate(responseBody.assignments[i].due);
          if (req.query.all == 'false' && responseBody.assignments[i].status == 'Submitted') {
              responseBody.assignments.splice(i,1);
          }
      }
      res.render('courseInfo', { 
            title: responseBody.id,
            course:  responseBody
        });
}

  module.exports.courseInfo = function(req, res){
      var requestOptions, path, all;
      path = '/api/courses/'+req.params.courseid;
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
          renderCoursePage(req, res, data);
        }
      );
 };

 var formatDate = function(date_string) {
     var date = new Date(date_string);
     var year, month, day;
     year = date.getFullYear();
     month = date.getMonth() + 1;
     day = date.getDate();
     return year + '-' + ((month < 10) ? '0' + month : month) + '-' + ((day < 10) ? '0' + day : day);
     return (date.getMonth()+1) + ' - ' + date.getDate() + ' - ' + date.getFullYear();
 }

 var renderEditAssignmentPage = function(req, res, responseBody) {
     var message;
     if (!(responseBody instanceof Object)) {
         message = "API lookup error";
         responseBody = {};
     }
     responseBody.assignment.due = formatDate(responseBody.assignment.due);
     res.render('editAssignment', {
         title: responseBody.course.id,
         courseDisplay: responseBody.course.id,
         assignment: responseBody.assignment,
         error: req.query.err
     });
 }

 module.exports.editAssignment = function(req, res) {
     var requestOptions, path;
     path = '/api/courses/'+req.params.courseid+'/assignments/'+req.params.assignmentid;
     requestOptions = {
         url: apiOptions.server + path,
         method: "GET",
         json : {},
         qs : {}
     };
     request(
         requestOptions,
         function(err, response, body) {
             var i, data;
             data = body;
             renderEditAssignmentPage(req, res, data);
         }
     );
 };

 var renderAddAssignmentPage = function(req, res, responseBody) {
     var message;
     if (!(responseBody instanceof Object)) {
         message = "API lookup error";
         responseBody = {};
     }
     res.render('addAssignment', {
         title: responseBody.id,
         courseId: responseBody._id,
         courseDisplay: responseBody.id,
         error: req.query.err
     });
 }

 module.exports.addAssignment = function(req, res){
     var requestOptions, path;
      path = '/api/courses/'+req.params.courseid;
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
          renderAddAssignmentPage(req, res, data);
        }
      );
};

module.exports.doAddAssignment = function(req, res){
  var requestOptions, path, courseid, postdata;
  courseid = req.params.courseid;
  path = "/api/courses/" + courseid + '/assignments/add';
  postdata = {
    name: req.body.name,
    due: req.body.due,
    points: req.body.points,
    status: req.body.status,
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "POST",
    json : postdata
  };
  if (!postdata.name || !postdata.due || !postdata.points || !postdata.status) {
    res.redirect('/' + courseid + '/assignment/add?err=val');
  }
  else if (postdata.points < 0 || postdata.points > 100) {
      res.redirect('/' + courseid + '/assignment/add?err=range');
  } else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 201) {
          res.redirect('/course/' + courseid);
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
            console.log(body);
          res.redirect('/' + courseid + '/assignment/add?err=val');
        } else {
          console.log(body);
          //_showError(req, res, response.statusCode);
        }
      }
    );
  }
};

module.exports.doEditAssignment = function(req, res){
  var requestOptions, path, courseid, postdata;
  courseid = req.params.courseid;
  assignmentid = req.params.assignmentid;
  path = "/api/courses/" + courseid + '/assignments/' + assignmentid + '/edit';
  postdata = {
    name: req.body.name,
    due: req.body.due,
    points: req.body.points,
    status: req.body.status
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "PUT",
    json : postdata
  };
  if (!postdata.name || !postdata.due || !postdata.points || !postdata.status) {
    res.redirect('/' + courseid + '/assignments/' + assignmentid +'/edit?err=val');
  } else if (postdata.points < 0 || postdata.points > 100) {
      res.redirect('/' + courseid + '/assignment/' + assignmentid + '/edit?err=range'); 
  } else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 200) {
          res.redirect('/course/' + courseid);
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError" ) {
          res.redirect('/' + courseid + '/assignments/' + assignmentid + '/edit?err=val');
        } else {
          console.log(body);
          //_showError(req, res, response.statusCode);
        }
      }
    );
  }
};

module.exports.doDeleteAssignment = function(req, res) {
    var courseid, assignmentid, requestOptions;
    courseid = req.params.courseid;
    assignmentid = req.params.assignmentid;
    path = "/api/courses/" + courseid + '/assignments/' + assignmentid;
    requestOptions = {
        url: apiOptions.server + path,
        method: 'DELETE',
        json: {}
    };
    request(
        requestOptions,
        function(err, response, body) {
            if (response.statusCode === 204) {
                res.redirect('/course/' + courseid);
            } else if (response.statusCode === 400) {
                res.redirect('/' + courseid + '/assignments/' + assignmentid + '?err=val');
            } else {
                  console.log(body);
                  //_showError(req, res, response.statusCode);
            }
         }
    );
}*/
