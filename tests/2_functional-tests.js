/* eslint-disable camelcase */
const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  suite('Routing Tests', function () {
    suite('POST /api/issues/{project} => conversion object', function () {
      test('Create an issue with every field', function (done) {
        chai
          .request(server)
          .post('/api/issues/project')
          .send({
            issue_title: 'All Fields Filled Test',
            issue_text: 'This is a test issue with all fields filled out',
            created_by: 'Ryan Jones',
            assigned_to: 'Alan Jones',
            status_text: 'In QA',
          })
          .end(function (err, res) {
            const {
              issue_title,
              issue_text,
              created_by,
              assigned_to,
              status_text,
              open,
              created_on,
              updated_on,
            } = res.body;
            assert.equal(res.status, 200);
            assert.equal(issue_title, 'All Fields Filled Test');
            assert.equal(
              issue_text,
              'This is a test issue with all fields filled out'
            );
            assert.equal(created_by, 'Ryan Jones');
            assert.equal(assigned_to, 'Alan Jones');
            assert.equal(status_text, 'In QA');
            assert.equal(open, 'open');
            assert.exists(created_on);
            assert.exists(updated_on);
            done();
          });
      });

      test('Create an issue with required fields only', function (done) {
        chai
          .request(server)
          .post('/api/issues/project')
          .send({
            issue_title: 'Only Required Fields Filled Test',
            issue_text:
              'This is a test issue with only required fields filled out',
            created_by: 'Ryan Jones',
          })
          .end(function (err, res) {
            const { issue_title, issue_text, created_by, status_text,
              open,
              created_on,
              updated_on,
            } = res.body;
            assert.equal(res.status, 200);
            assert.equal(issue_title, 'Only Required Fields Filled Test');
            assert.equal(
              issue_text,
              'This is a test issue with only required fields filled out'
            );
            assert.equal(created_by, 'Ryan Jones');
            assert.equal(status_text, '');
            assert.equal(open, 'open');
            assert.exists(created_on);
            assert.exists(updated_on);
            done();
          });
        });

      test('Create an issue with missing required fields', function (done) {
        chai.request(server).post('/api/issues/project').send({issue_title: 'Missing Fields Test'}).
      })
    });
  });
});
