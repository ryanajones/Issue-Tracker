const mongoose = require('mongoose');
const mongoDB = require('mongodb');

// MongoDB and Mongoose connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database schema
const { Schema } = mongoose;

const issuesSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  created_on: { type: Date, default: new Date().toUTCString },
  updated_on: { type: Date, default: new Date().toUTCString },
  assigned_to: { type: String, default: '' },
  open: { type: String, required: true, default: true },
  status_text: { type: String, default: true },
});

const projectSchema = new Schema({
  project_name: String,
  issues: [
    {
      type: Schema.Types.ObjectId,
      ref: 'issues',
    },
  ],
});

const Issues = mongoose.model('issues', issuesSchema);

const Projects = mongoose.model('projects', projectSchema);

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(async function (req, res) {
      const { project } = req.params;
      try {
        const findOne = await Projects.findOne({
          project_name: project,
        });

        if (findOne) {
          console.log(findOne.project_name);
          /*           res.json({
            findOne,
          }); */
        } else {
          const newProject = new Projects({ project_name: project });
          await newProject.save();
        }
      } catch (err) {
        console.log(err);
      }
    })

    .post(function (req, res) {
      const { project } = req.params;
      console.log(project.data);
    })

    .put(function (req, res) {
      const { project } = req.params;
    })

    .delete(function (req, res) {
      const { project } = req.params;
    });
};
