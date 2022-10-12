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

const setCsrfToken = async (req, res, next) => {
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
  const build_secrets = async () => {
    if (res.locals.csrf) {
      return new Promise.resolve();
    }
    let csrfSecret;
    if (!req.session.csrfSecret) {
      const bytes = await random_promise(10);
      csrfSecret = bytes.toString("hex");
      req.session.csrfSecret = csrfSecret;
    }
    const salt = await bcrypt.genSalt(10);
    const csrf = await bcrypt.hash(
      csrfSecret + process.env.SESSION_SECRET,
      salt
    );
    res.locals.csrf = csrf.toString("hex");
    return;
  };
  let csrf_promise;
  if (!req.session.csrf_promise) {
    csrf_promise = build_secrets();
    req.session.csrf_promise = csrf_promise;
  }

  await req.session.csrf_promise;
  delete req.session.csrf_promise;
  next();
};

const checkCsrfToken = async (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    let result = false;
    if (req.body.csrf) {
      result = await bcrypt.compare(
        res.locals.csrfSecret + process.env.SESSION_SECRET,
        req.body.csrf
      );
    }
    if (!result) {
      return next(new Error("CSRF violation"));
    }
  }
  next();
};

module.exports = {
  authMiddleware,
  setCurrentUser,
  setCsrfToken,
  checkCsrfToken,
};
