const parseCookies = (req, res, next) => {
  var cookie = req.headers.cookie;
  if (!cookie) {
    next();
    return;
  } else {
    var cookiesArr = cookie.split('; ');
    cookiesArr.forEach((item) => {
      var a = item.split('=');
      req.cookies[a[0]] = a[1];
    });
    next();
  }
};

module.exports = parseCookies;