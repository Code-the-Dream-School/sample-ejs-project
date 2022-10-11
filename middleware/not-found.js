const notFoundMiddleware = (req, res) => {
  res
    .status(404)
    .render("pages/not-found", { url: req.url, errors: [], info: [] });
};

module.exports = notFoundMiddleware;
