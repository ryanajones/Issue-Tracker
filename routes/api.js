/* eslint-disable camelcase */
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
  created_on: { type: Date, default: new Date().toUTCString() },
  updated_on: { type: Date, default: new Date().toUTCString() },
  assigned_to: { type: String, default: '' },
  open: { type: String, required: true, default: true },
  status_text: { type: String, default: '' },
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

      // Find project and display issues.
      // Create new project if no project found.

      try {
        const findProject = await Projects.findOne({ project_name: project });

        if (findProject) {
          res.json({ issues: findProject.issues });
        } else {
          const newProject = new Projects({ project_name: project });
          await newProject.save();
        }
      } catch (err) {
        console.log(err);
      }
    })
    /*             Projects.findOne({ project_name: project })
                  .populate('issues')
                  .exec(function (err, proj) {
                    if (err) return console.log(err);
                    console.log(proj);
                  }); */

    .post(function (req, res) {
      const { project } = req.params;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;

      const findProject = Projects.findOne(
        { project_name: project },
        (err, foundProj) => {
          const newIssue = {
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
          };
          if (foundProj) {
            Issues.create(newIssue, (err, issue) => {
              if (err) return console.log(err);
              foundProj.issues.push(issue);
              foundProj.save((err, savedProj) => {
                if (err) return console.log(err);
                return res.json(issue);
              });
            });
          } else {
            Projects.create({ project_name: project }, (err, newProj) => {
              if (err) return console.log(err);
              Issues.create(newIssue, (err, issue) => {
                if (err) return console.log(err);
                newProj.issues.push(issue);
                newProj.save((err, savedProj) => {
                  if (err) return console.log(err);
                  return res.json(issue);
                });
              });
            });
          }
        }
      );
    })

    .put(function (req, res) {
      const { project } = req.params;
    })

    .delete(function (req, res) {
      const { project } = req.params;
    });
};
