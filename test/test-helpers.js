/* eslint-disable quotes */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      password: 'AB123456',
    },
    {
      id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      password: 'AB123456',
    },
    {
      id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      password: 'AB123456',
    }
  ];
}

function makeTvArray(users) {
  return [
    {
      id: 1,
      tv_title: 'Stranger Things',
      status: 'Planning to Watch',
      season_number: 1,
      episode_number: 10,
      rating: 4,
      genre: 'Action',
      description: 'Lorem Ipsum',
      review: 'This was a good show',
      user_id: users[0].id
    },
    {
      id: 2,
      tv_title: 'Black Mirror',
      status: 'Currently Watching',
      season_number: 1,
      episode_number: 10,
      rating: 3,
      genre: 'Thriller',
      description: 'Lorem Ipsum',
      review: 'This was a good show',
      user_id: users[0].id
    },
    {
      id: 3,
      tv_title: 'Haunting of Hill House',
      status: 'Completed',
      season_number: 1,
      episode_number: 10,
      rating: 2,
      genre: 'Mystery',
      description: 'Lorem Ipsum',
      review: 'This was a good show',
      user_id: users[0].id
    }
  ];
}

function makeExpectedTvShow(users, show) {
  const user = users
    .find(user => user.id === show.user_id);

  return {
    id: show.id,
    tv_title: show.tv_title,
    status: show.status,
    season_number: show.season_number,
    episode_number: show.episode_number,
    rating: show.rating,
    genre: show.genre,
    description: show.description,
    review: show.review,
    user_id: user.id
  };
}

function makeMaliciousShow(user) {
  const maliciousShow = {
    id: 911,
    tv_title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    status: 'Planning to Watch',
    season_number: 1,
    episode_number: 10,
    rating: 2,
    genre: 'Action',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    review: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    user_id: user.id,
  };
  const expectedShow = {
    ...makeExpectedTvShow([user], maliciousShow),
    tv_title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    review: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  };
  return {
    maliciousShow,
    expectedShow,
  };
}

function makeTvFixtures() {
  const testUsers = makeUsersArray();
  const testShows = makeTvArray(testUsers);
  return { testUsers, testShows };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      tv_table,
      tv_users`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user, password: bcrypt.hashSync(user.password, 1)
  }));
  return db.into('tv_users').insert(preppedUsers)
    .then(() => 
      db.raw(
        `SELECT setval('tv_users_id_seq', ?)`,
        [users[users.length - 1].id]
      )
    );
}

function seedTvTable(db, users, shows) {
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into('tv_table').insert(shows);
    await trx.raw(
      `SELECT setval('tv_table_id_seq', ?)`,
      [shows[shows.length - 1].id],
    );
  });
}

function seedMaliciousShow(db, user, show) {
  return seedUsers(db, [user])
    .then(() => 
      db
        .into('tv_table')
        .insert([show])
    );    
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({user_id: user.id}, secret, {subject: user.user_name, algorithm: 'HS256'});
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeTvArray,
  makeExpectedTvShow,
  makeMaliciousShow,
  

  makeTvFixtures,
  cleanTables,
  seedTvTable,
  seedMaliciousShow,
  makeAuthHeader,
  seedUsers
};