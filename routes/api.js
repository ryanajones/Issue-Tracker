/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
const mongoose = require('mongoose');

// MongoDB and Mongoose connect
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, db) => {
    if (err) return console.log(err);
    console.log('Successful database connection.');
  }
);

// Database schemas
const { Schema } = mongoose;

const issuesSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  created_on: { type: Date, default: new Date().toUTCString() },
  updated_on: { type: Date, default: new Date().toUTCString() },
  assigned_to: { type: String, default: '' },
  open: { type: Boolean, required: true, default: true },
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

    // Handle GET request to receive JSON response of project specific
    // issues. If project route parameter doesn't
    // match any project name in database, then make a new project

    .get(function (req, res) {
      const { project } = req.params;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.query;

      // Find project and populate issues
      Projects.findOne({ project_name: project })
        .populate('issues')
        .exec(function (err, proj) {
          if (err) return console.log(err);
          // If no query parameters and no project found, make a new project
          if (Object.keys(req.query).length === 0) {
            if (proj == null) {
              Projects.create({ project_name: project }, (err, newProj) => {
                if (err) return console.log(err);
                return res.json(newProj.issues);
              });
            }
            if (proj) return res.json(proj.issues);
          } else {
            // Match query keys to project issues and filter to show matches
            Object.keys(req.query).forEach((key) => {
              proj.issues = proj.issues.filter(
                (issue) => issue[key] == req.query[key]
              );
            });
            return res.json(proj.issues);
          }
        });
    })

    // Handle POST request to make new issue for projct
    .post(function (req, res) {
      const { project } = req.params;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;

      // If required fields are missing return JSON error
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      Projects.findOne({ project_name: project }, (err, foundProj) => {
        const newIssue = {
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
        };
        // If project is found, push new issue to project issues array
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
          // If project is not found, make new project and push new issue
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
      });
    })

    // Handle PUT request to update issue for specific project
    .put(function (req, res) {
      const { project } = req.params;
      const { _id } = req.body;
      // Create object with updated key value pairs from request body
      const updatedObj = {};
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== '') {
          updatedObj[key] = req.body[key];
        }
      });
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      if (Object.keys(updatedObj).length < 2) {
        return res.json({ error: 'no update field(s) sent', _id });
      }
      updatedObj.updated_on = new Date().toUTCString();
      Issues.findByIdAndUpdate(
        _id,
        updatedObj,
        { new: true },
        (err, updatedIssue) => {
          if (updatedIssue) {
            return res.json({ result: 'successfully updated', _id });
          }
          return res.json({ error: 'could not update', _id });
        }
      );
    })

    // Handle DELETE request to delete issue for specific project
    .delete(function (req, res) {
      const { project } = req.params;
      const { _id } = req.body;
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      // Delete reference id object of issue in projects model
      Projects.findOne({ project_name: project }, (err, foundProj) => {
        if (err) return console.log(err);
        foundProj.issues.remove(_id);
        foundProj.save();
      });
      // Delete corresponding issue from issues model
      Issues.findByIdAndDelete(_id, (err, deletedIssue) => {
        if (deletedIssue) {
          return res.json({ result: 'successfully deleted', _id });
        }
        return res.json({ error: 'could not delete', _id });
      });
    });
};
