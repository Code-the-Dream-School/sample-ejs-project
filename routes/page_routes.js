const express = require("express");
const passport = require("passport");
const router = express.Router();
const { refreshCSRF } = require("../middleware/auth");

const {
  render_index,
  render_sign_up,
  sign_up,
  log_out,
  logon,
} = require("../controllers/page_controller");

router.route("/").get(render_index);
router.route("/sign-up").get(render_sign_up).post(sign_up);
router
  .route("/logon")
  .get(logon)
  .post(
    passport.authenticate("local", {
      successRedirect: "/jobs",
      failureRedirect: "/logon",
      failureFlash: true,
    }),
    refreshCSRF
  );
router.route("/logoff").get(log_out);

module.exports = router;
