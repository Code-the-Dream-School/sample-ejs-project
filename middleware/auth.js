const crypto = require("crypto");
const session = require("express-session");

const authMiddleware = (req, res, next) => {
  if (!req.user) {
    req.flash("error", "You can't access that page before logon.");
    res.redirect("/");
  } else {
    next();
  }
};

const setCurrentUser = (req, res, next) => {
  res.locals.currentUser = req.user;
  next();
};

const setCsrfToken = (req,res,next) => {
  if (!req.session.csrf) {
      const bytes = crypto.randomBytes(10);
      const csrf = bytes.toString('hex');
      req.session.csrf = csrf;
      res.locals.csrf = csrf;
      return next();  
  }
  res.locals.csrf = req.session.csrf;
  next();
};

const checkCsrfToken = (req,res,next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    if (req.body.csrf != req.session.csrf) {
      return next(new Error("CSRF violation"));
    }
  }
  next();
};

module.exports = { authMiddleware, setCurrentUser, setCsrfToken, checkCsrfToken };
