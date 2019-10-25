/* eslint-disable no-useless-escape */
/* eslint-disable quotes */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Auth Endpoints', () => {
  let db;

  const {
    testUsers,
    testShows
  } = helpers.makeTvFixtures();
  const testUser = testUsers[0];

  before('Connect to DB before ALL tests', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('Disconnect from DB after ALL tests', () => db.destroy());

  before('Clear tables before ALL tests', () => helpers.cleanTables(db));

  afterEach('Clear table after EACH test', () => helpers.cleanTables(db));

  describe('POST /api/users/', () => {
    beforeEach('insert shows', () =>
      helpers.seedTvTable(
        db,
        testUsers,
        testShows
      )
    );

    it('responds with 400 missing user_name if not supplied', () => {
      const newUserMissingUserName = {
        full_name: 'Test User',
        password: 'AB123456'
      };
      return supertest(app)
        .post('/api/users')
        .send(newUserMissingUserName)
        .expect(400, {error: 'Missing user_name in request body'});
    });
    it('responds with 400 missing full_name if not supplied', () => {
      const newUserMissingFullName = {
        user_name: 'test-user',
        password: 'AB123456'
      };
      return supertest(app)
        .post('/api/users')
        .send(newUserMissingFullName)
        .expect(400, {error: 'Missing full_name in request body'});
    });
    it('responds with 400 missing password if not supplied', () => {
      const newUserMissingPassword = {
        full_name: 'Test User',
        user_name: 'test-user'
      };
      return supertest(app)
        .post('/api/users')
        .send(newUserMissingPassword)
        .expect(400, {error: 'Missing password in request body'});
    });
    it('responds with 400 when password is less than 8 characters', () => {
      const newUser = {
        full_name: 'Test User',
        user_name: 'test-user',
        password: 'AB1234'
      };
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400, {error: 'Password must be at least 8 characters'});
    });
    it('responds with 400 when password is longer than 72 characters', () => {
      const newUser = {
        full_name: 'Test User',
        user_name: 'test-user',
        password: 'AB1234P84O9q7MD28Z51JEK3lt3ny2EFcwC6rPOU37l20gUApC263L8Jr7Vi0c74uM3xXXFInBE4POBfct7Y6yOnUHSS41mR7B75IPyP83lgwvaVHvYgBHBKZLaLZ9IHqnRsc9sJyk7jeU'
      };
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400, {error: 'Password must be less than 72 characters'});
    });
    it('responds with 400 when password starts or ends with empty space', () => {
      const newUser = {
        full_name: 'Test User',
        user_name: 'test-user',
        password: ' AB12345 '
      };
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400, {error: 'Password must not start or end with empty spaces'});
    });
    it('responds with 400 when password does not contain at least one uppercase, lowercase, and number character', () => {
      const newUser = {
        full_name: 'Test User',
        user_name: 'test-user',
        password: 'abcdefghi'
      };
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400, {error: 'Password must contain at least one upper case, lower case, and number character'});
    });
    it('respond with 400 when username is submitted that already exists', () => {
      const existingUser = {
        full_name: 'Test User',
        user_name: testUser.user_name,
        password: 'Ab123456'
      };
      return supertest(app)
        .post('/api/users')
        .send(existingUser)
        .expect(400, {error: 'Username already taken'});
    });
    it('returns 201 and adds a new user', () => { 
      const newUser = {
        user_name: 'test-user',
        full_name: 'Test User',
        password: 'Ab123456'
      };

      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body.user_name).to.eql(newUser.user_name);
          expect(res.body.full_name).to.eql(newUser.full_name);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
        });
    });
    it('removes XSS attack content from response', () => {
      before('Insert users', () => {
        helpers.seedUsers (
          db,
          testUsers
        );
      });
      const maliciousUser = {
        full_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        user_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        password: 'Naughty1 naughty very naughty <script>alert("xss");</script>'
      };

      const expectedUser = {
        full_name: `Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;`,
        user_name: `Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;`,
        password: `Naughty1 naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;`
      };

      return supertest(app)
        .post('/api/users')
        .send(maliciousUser)
        .expect(201)
        .expect(res => {
          expect(res.body.full_name).to.eql(expectedUser.full_name);
          expect(res.body.user_name).to.eql(expectedUser.user_name);
          expect(res.body).to.have.property('id');
        });
    });
  });
}); 