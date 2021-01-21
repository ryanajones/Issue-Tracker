/* eslint-disable camelcase */
const chaiHttp = require('chai-http');
const chai = require('chai');

const { assert } = chai;
const server = require('../server');

let id;

chai.use(chaiHttp);

suite('Functional Tests', function () {
  suite('Routing Tests', function () {
    // POST tests
    suite('POST /api/issues/{project}', function () {
      test('Create an issue with every field', function (done) {
        chai
          .request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'All Fields Filled Test',
            issue_text: 'This is a test issue with all fields filled out',
            created_by: 'Ryan Jones',
            assigned_to: 'Alan Jones',
            status_text: 'In QA',
          })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            const {
              _id,
              issue_title,
              issue_text,
              created_by,
              assigned_to,
              status_text,
              open,
              created_on,
              updated_on,
            } = res.body;
            id = _id;
            assert.equal(res.status, 200);
            assert.equal(issue_title, 'All Fields Filled Test');
            assert.equal(
              issue_text,
              'This is a test issue with all fields filled out'
            );
            assert.equal(created_by, 'Ryan Jones');
            assert.equal(assigned_to, 'Alan Jones');
            assert.equal(status_text, 'In QA');
            assert.equal(open, true);
            assert.exists(created_on);
            assert.exists(updated_on);
            done();
          });
      });

      test('Create an issue with required fields only', function (done) {
        chai
          .request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Only Required Fields Filled Test',
            issue_text:
              'This is a test issue with only required fields filled out',
            created_by: 'Ryan Jones',
          })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            const {
              issue_title,
              issue_text,
              created_by,
              status_text,
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
            assert.equal(open, true);
            assert.exists(created_on);
            assert.exists(updated_on);
            done();
          });
      });

      test('Create an issue with missing required fields => { issue_title: "required field(s) missing" }', function (done) {
        chai
          .request(server)
          .post('/api/issues/test')
          .send({ issue_title: 'Missing Required Fields Test' })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'required field(s) missing');
            done();
          });
      });
    });

    // GET tests
    suite('GET /api/issues/{test}', function () {
      test('View issues on a test', function (done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({})
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_by');
            done();
          });
      });

      test('View issues on a test with one filter', function (done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({ created_by: 'Ryan Jones' })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body[0].created_by, 'Ryan Jones');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_by');
            done();
          });
      });

      test('View issues on a test with multiple filters', function (done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({
            created_by: 'Ryan Jones',
            assigned_to: 'Alan Jones',
          })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body[0].created_by, 'Ryan Jones');
            assert.equal(res.body[0].assigned_to, 'Alan Jones');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_by');
            done();
          });
      });
    });

    // PUT tests
    suite('PUT /api/issues/{test}', function () {
      test('Update one field on an issue => { result: "successfully updated", _id: _id }', function (done) {
        chai
          .request(server)
          .put('/api/issues/test')
          .send({
            _id: id,
            created_by: 'Ryan Alan Jones',
          })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.deepEqual(res.body.result, 'successfully updated');
            assert.deepEqual(res.body._id, id);
            done();
          });
      });

      test('Update multiple fields on an issue => { result: "successfully updated" }', function (done) {
        chai
          .request(server)
          .put('/api/issues/test')
          .send({
            _id: id,
            created_by: 'Ryan Jones',
            assigned_to: 'RAJ',
          })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.deepEqual(res.body.result, 'successfully updated');
            assert.deepEqual(res.body._id, id);
            done();
          });
      });

      test('Update an issue with missing _id => { error: "missing _id" }', function (done) {
        chai
          .request(server)
          .put('/api/issues/test')
          .send({ created_by: 'Ryan Jones' })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });

      test('Update an issue with no fields to update => { error: "no updated field(s) sent" }', function (done) {
        chai
          .request(server)
          .put('/api/issues/test')
          .send({ _id: id })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'no update field(s) sent');
            assert.deepEqual(res.body._id, id);
            done();
          });
      });

      test('Updated an issue with an invalid _id => { error: "could not update" }', function (done) {
        chai
          .request(server)
          .put('/api/issues/test')
          .send({ _id: '5f665eb46e296f6b9b6a504d', assigned_to: 'Ry' })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not update');
            done();
          });
      });
    });

    // DELETE tests
    suite('DELETE /api/issues/{test}', function () {
      test('Delete an issue => { result: "successfully deleted" }', function (done) {
        chai
          .request(server)
          .delete('/api/issues/test')
          .send({ _id: id })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.body.result, 'successfully deleted');
            assert.equal(res.body._id, id);
            done();
          });
      });

      test('Delete an issue with an invalid _id => { error: "could not delete" }', function (done) {
        const invalidID = '5f665eb46e296f6b9b6a504d';
        chai
          .request(server)
          .delete('/api/issues/test')
          .send({ _id: invalidID })
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not delete');
            assert.equal(res.body._id, invalidID);
            done();
          });
      });

      test('Delete an issue with missing _id => { error: "missing _id" }', function (done) {
        chai
          .request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
    });
  });
});
