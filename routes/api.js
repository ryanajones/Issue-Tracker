module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(function (req, res) {
      const { project } = req.params;
    })

    .post(function (req, res) {
      const { project } = req.params;
    })

    .put(function (req, res) {
      const { project } = req.params;
    })

    .delete(function (req, res) {
      const { project } = req.params;
    });
};
