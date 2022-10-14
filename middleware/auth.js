const crypto = require("crypto");
const bcrypt = require("bcryptjs");

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

const setCsrf = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const csrf = await bcrypt.hash(
    req.session._csrfSecret + process.env.SESSION_SECRET,
    salt
  );
  res.locals._csrf = csrf;
};

const csrf = async (req, res, next) => {
  const random_promise = (length) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (err, bytes) => {
        if (err) {
          return reject(err);
        }
        resolve(bytes);
      });
    });
  };
  if (!req.session._csrfSecret) {
    let newSecret = await random_promise(10);
    newSecret = newSecret.toString("hex");
    if (!req.session._csrfSecret) {
      // may have been set by another request
      // if so we won't change it
      req.session._csrfSecret = newSecret;
    }
  }
  if (req.method === "POST") {
    let content_type = req.get("content-type");
    content_type = content_type.toLowerCase();
    if (
      content_type === "application/x-www-form-urlencoded" ||
      content_type === "text/plain" ||
      content_type === "multipart/form-data"
    ) {
      let result = false;
      if (req.body && req.body._csrf) {
        result = await bcrypt.compare(
          req.session._csrfSecret + process.env.SESSION_SECRET,
          req.body._csrf
        );
      }
      if (!result) {
        return next(
          new CsrfError(
            "A POST request was received without a valid CSRF token."
          )
        );
      }
    }
  }
  next();
};

module.exports = {
  authMiddleware,
  setCurrentUser,
  setCsrf,
  csrf,
};
