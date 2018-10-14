const models = require('../models');
const Promise = require('bluebird');
const _ = require('lodash');

module.exports.createSession = (req, res, next) => {

  if (_.isEmpty(req.cookies)) {
    models.Sessions.create()
      .then((prom) => {
        var sessionId = prom.insertId;
        return models.Sessions.get({id: sessionId});
      })
      .then((row) => {
        var hash = row.hash;
        req.session = { hash: hash };
        // console.log("Before cookies: ", res.cookies);
        // res.cookies = { shortlyid: {value: hash} };
        res.cookie('shortlyid', hash);
        // console.log("After cookies: ", res.cookies);
        next();
      });
  } else {
    let hash = req.cookies.shortlyid;

    models.Sessions.get({hash: hash})
      .then((data)=>{
        if (data !== undefined) {
          let id = data.userId;
          if (id !== null) {
            models.Users.get({id: id})
              .then((person) => {
                let username = person.username;
                req.session = { hash: hash, user: {username: username}, userId: id };
                next();
              });
          } else {
            req.session = { hash: hash };
            // console.log('SESSION OBJ: ', req.session);
            next();
          }
        } else {
          // console.log('no data in session table');
          models.Sessions.create()
            .then((prom) => {
              var sessionId = prom.insertId;
              return models.Sessions.get({id: sessionId});
            })
            .then((row) => {
              var hash = row.hash;
              req.session = { hash: hash };
              res.cookie('shortlyid', hash);
              next();
            });
        }
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

