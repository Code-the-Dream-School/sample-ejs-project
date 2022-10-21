const { randomUUID } = require("crypto");

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

class CsrfError extends Error {
  constructor(message) {
    super(message);
    this.name = "CsrfError";
  }
}

const csrf = (req, res, next) => {
  let _csrf = null;
  if (!req.session._csrf) {
    _csrf = randomUUID();
    req.session._csrf = _csrf;
  } else {
    _csrf = req.session._csrf;
  }
  res.locals._csrf = _csrf;
  if (req.method === "POST") {
    let content_type = req.get("content-type");
    let protected_content = false;
    if (!content_type) {
      protected_content = true;
    } else {
      content_type = content_type.toLowerCase();
      if (
        content_type === "application/x-www-form-urlencoded" ||
        content_type === "text/plain" ||
        content_type === "multipart/form-data"
      ) {
        protected_content = true;
      }
      if (protected_content) {
        if (!req.body || req.body._csrf != _csrf)
          throw new CsrfError(
            "A POST request was received without a valid CSRF token."
          );
      }
    }
  }
  next();
};

const refreshCSRF = (req, res) => {
  req.session._csrf = randomUUID();
  res.locals._csrf = req.session._csrf;
}

module.exports = {
  authMiddleware,
  setCurrentUser,
  csrf,
  refreshCSRF,
};
