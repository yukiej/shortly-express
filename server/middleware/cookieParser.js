const parseCookies = (req, res, next) => {
  // console.log('REQ: ', req);

  var cookie = req.headers.cookie;
  // console.log('cookie: ', cookie);
  if (!cookie) {
    next();
    return;
  } else {
    var cookiesArr = cookie.split('; ');
    cookiesArr.forEach((item) => {
      var a = item.split('=');
      req.cookies[a[0]] = a[1];
    });
    
    // console.log(req.cookies);
    next();
  }
};

module.exports = parseCookies;