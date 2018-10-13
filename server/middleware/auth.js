const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  if (!req.headers.cookie) {
    next();
    return;
  }
  return models.Sessions.create( () => {
    req.session.user = next;
    res.redirect('/');
  });
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

