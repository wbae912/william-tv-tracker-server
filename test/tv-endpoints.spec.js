/* eslint-disable quotes */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('TV Endpoints', function() {
  let db;

  const {
    testUsers,
    testShows
  } = helpers.makeTvFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe(`GET /api/shows/all`, () => {
    context(`Given no shows`, () => {
      before('Insert users', () => {
        helpers.seedUsers (
          db,
          testUsers
        );
      });
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/shows/all')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('Given there are shows in the database', () => {
      beforeEach('insert shows', () =>
        helpers.seedTvTable(
          db,
          testUsers,
          testShows
        )
      );

      it('responds with 200 and all of the shows', () => {
        const expectedShows = testShows.map(show =>
          helpers.makeExpectedTvShow(
            testUsers,
            show
          )
        );
        return supertest(app)
          .get('/api/shows/all')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedShows);
      });
    });

    context(`Given an XSS attack show`, () => {
      const testUser = helpers.makeUsersArray()[0];
      const {
        maliciousShow,
        expectedShow,
      } = helpers.makeMaliciousShow(testUser);

      beforeEach('insert malicious show', () => {
        return helpers.seedMaliciousShow(
          db,
          testUser,
          maliciousShow,
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/shows/all`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].tv_title).to.eql(expectedShow.tv_title);
            expect(res.body[0].description).to.eql(expectedShow.description);
            expect(res.body[0].review).to.eql(expectedShow.review);
          });
      });
    });
  });

  describe(`GET /api/shows/all/:id`, () => {
    context(`Given no shows`, () => {
      beforeEach(() =>
        helpers.seedUsers(db,testUsers)
      );

      it(`responds with 404`, () => {
        const showId = 123456;
        return supertest(app)
          .get(`/api/shows/all/${showId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `TV show not found` });
      });
    });

    context('Given there are shows in the database', () => {
      beforeEach('insert shows', () =>
        helpers.seedTvTable(
          db,
          testUsers,
          testShows
        )
      );

      it('responds with 200 and the specified show', () => {
        const showId = 2;
        const expectedShow = helpers.makeExpectedTvShow(
          testUsers,
          testShows[showId - 1]
        );

        return supertest(app)
          .get(`/api/shows/all/${showId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedShow);
      });
    });

    context(`Given an XSS attack show`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const {
        maliciousShow,
        expectedShow,
      } = helpers.makeMaliciousShow(testUser);

      beforeEach('insert malicious show', () => {
        return helpers.seedMaliciousShow(
          db,
          testUser,
          maliciousShow,
        );
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/shows/all/${maliciousShow.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.tv_title).to.eql(expectedShow.tv_title);
            expect(res.body.description).to.eql(expectedShow.description);
            expect(res.body.review).to.eql(expectedShow.review);
          });
      });
    });
  });

  describe(`POST /api/shows/all`, () => {
    beforeEach('insert shows', () =>
      helpers.seedTvTable(
        db,
        testUsers,
        testShows
      )
    );

    it('responds with 400 missing tv_title if not supplied', () => {
      const newShowMissingTitle = {
        status: 'Currently Watching',
        season_number: 1,
        episode_number: 10,
        rating: 3,
        genre: 'Thriller',
        description: 'Lorem Ipsum',
        review: 'This was a good show',
        user_id: testUsers[0].id
      };
      return supertest(app)
        .post('/api/shows/all')
        .send(newShowMissingTitle)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400, {error: 'TV show name is required'});
    });
    it('responds with 400 missing status if not supplied', () => {
      const newShowMissingStaus = {
        tv_title: 'Example',
        season_number: 1,
        episode_number: 10,
        rating: 3,
        genre: 'Thriller',
        description: 'Lorem Ipsum',
        review: 'This was a good show',
        user_id: testUsers[0].id
      };
      return supertest(app)
        .post('/api/shows/all')
        .send(newShowMissingStaus)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400, {error: 'Status is required'});
    });
    it('responds with 400 when rating is not whole number > 0', () => {
      const newShowBadRating = {
        tv_title: 'Example',
        status: 'Planning to Watch',
        season_number: 1,
        episode_number: 10,
        rating: -3.5,
        genre: 'Thriller',
        description: 'Lorem Ipsum',
        review: 'This was a good show',
        user_id: testUsers[0].id
      };
      return supertest(app)
        .post('/api/shows/all')
        .send(newShowBadRating)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400, {error: 'Rating must be a whole number between 1-5'});
    });
    it('responds with 400 when season number is not whole number > 0', () => {
      const newShowBadSeason = {
        tv_title: 'Example',
        status: 'Planning to Watch',
        season_number: -5.5,
        episode_number: 10,
        rating: 4,
        genre: 'Thriller',
        description: 'Lorem Ipsum',
        review: 'This was a good show',
        user_id: testUsers[0].id
      };
      return supertest(app)
        .post('/api/shows/all')
        .send(newShowBadSeason)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400, {error: 'Season Number must be a whole number greater than 0'});
    });
    it('responds with 400 when episode number is not whole number > 0', () => {
      const newShowBadEpisode = {
        tv_title: 'Example',
        status: 'Planning to Watch',
        season_number: 5,
        episode_number: -10.1,
        rating: 4,
        genre: 'Thriller',
        description: 'Lorem Ipsum',
        review: 'This was a good show',
        user_id: testUsers[0].id
      };
      return supertest(app)
        .post('/api/shows/all')
        .send(newShowBadEpisode)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400, {error: 'Episode Number must be a whole number greater than 0'});
    });
    it('returns 201 and adds a new show', () => {
      const newShow = {
        tv_title: 'Example',
        status: 'Planning to Watch',
        season_number: 5,
        episode_number: 10,
        rating: 4,
        genre: 'Thriller',
        description: 'Lorem Ipsum',
        review: 'This was a good show',
        user_id: testUsers[0].id
      };
      return supertest(app)
        .post('/api/shows/all')
        .send(newShow)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(201)
        .expect(res => {
          expect(res.body.tv_title).to.eql(newShow.tv_title);
          expect(res.body.status).to.eql(newShow.status);
          expect(res.body.season_number).to.eql(newShow.season_number);
          expect(res.body.episode_number).to.eql(newShow.episode_number);
          expect(res.body.rating).to.eql(newShow.rating);
          expect(res.body.genre).to.eql(newShow.genre);
          expect(res.body.description).to.eql(newShow.description);
          expect(res.body.review).to.eql(newShow.review);
          expect(res.body.user_id).to.eql(newShow.user_id);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/shows/all/${res.body.id}`);
        });
    });
    it('removes XSS attack content from response', () => {
      before('Insert users', () => {
        helpers.seedUsers (
          db,
          testUsers
        );
      });
      const user = testUsers[0];
      const { maliciousShow, expectedShow } = helpers.makeMaliciousShow(user);

      return supertest(app)
        .post('/api/shows/all')
        .send(maliciousShow)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(201)
        .expect(res => {
          expect(res.body.tv_title).to.eql(expectedShow.tv_title);
          expect(res.body.status).to.eql(expectedShow.status);
          expect(res.body.season_number).to.eql(expectedShow.season_number);
          expect(res.body.episode_number).to.eql(expectedShow.episode_number);
          expect(res.body.rating).to.eql(expectedShow.rating);
          expect(res.body.genre).to.eql(expectedShow.genre);
          expect(res.body.description).to.eql(expectedShow.description);
          expect(res.body.review).to.eql(expectedShow.review);
          expect(res.body.user_id).to.eql(expectedShow.user_id);
          expect(res.body).to.have.property('id');
        });
    });
  });

  describe('DELETE /api/shows/all/:id', () => {
    context('Given that data does not exist', () => {
      before('insert shows', () =>
        helpers.seedTvTable(
          db,
          testUsers,
          testShows
        )
      );
      it('returns a 404 status with message of show not found', () => {
        const id = 9999;
        return supertest(app)
          .delete(`/api/shows/all/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, {error: 'TV show not found'});
      });
    });

    context('Given that the data exists', () => {
      beforeEach('insert shows', () =>
        helpers.seedTvTable(
          db,
          testUsers,
          testShows
        )
      );

      it('returns a status of 204 and deletes the show', () => {
        const id = 2;
        const expectedResult = testShows.filter(show => show.id !== id);

        return supertest(app)
          .delete(`/api/shows/all/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(() => {
            supertest(app)
              .get('/api/shows/all')
              .expect(expectedResult);
          });
      });
    });
  });

  describe('PATCH /api/shows/all/:id', () => {
    context('Given that there is no data', () => {
      before('insert shows', () =>
        helpers.seedTvTable(
          db,
          testUsers,
          testShows
        )
      );
      it('returns a 404 status when show is not found', () => {
        const id = 9999;
        return supertest(app)
          .patch(`/api/shows/all/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, {error: 'TV show not found'});
      });
    });

    context('Given that there is data', () => {
      beforeEach('insert shows', () =>
        helpers.seedTvTable(
          db,
          testUsers,
          testShows
        )
      );

      it('returns a 204 and updates a show', () => {
        const id = 2;
        const updatedShow = {
          tv_title: 'New title',
          status: 'Completed',
          season_number: 5,
          episode_number: 10,
          rating: 4,
          genre: 'Thriller',
          description: 'Lorem Ipsum',
          review: 'This was a good show',
          user_id: testUsers[0].id
        };

        const expectedShow = {...testShows[id - 1], ...updatedShow};

        return supertest(app)
          .patch(`/api/shows/all/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(updatedShow)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get(`/api/shows/all/${id}`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(200, expectedShow);
          });
      });

      it('returns a 400 when no required fields supplied', () => {
        const id = 2;
        return supertest(app)
          .patch(`/api/shows/all/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send( {invalid: 'bogus'} )
          .expect(400, {error: 'Request body must contain tv_title, status, season_number, episode_number, rating, genre, description, or review'});
      });

      it('returns a 204 when at least one required field is provided and ignores bogus fields', () => {
        const id = 2;
        const updatedShow = {
          tv_title: 'new title',
        };

        const expectedShow = {
          ...testShows[id - 1], ...updatedShow
        };

        return supertest(app)
          .patch(`/api/shows/all/${id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send( {...updatedShow, fieldToIgnore: 'should be ignored'} )
          .expect(204)
          .then(() => 
            supertest(app)
              .get(`/api/shows/all/${id}`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(200, expectedShow)
          );
      });
    });
  });
});