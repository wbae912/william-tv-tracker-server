const bcrypt = require('bcryptjs');
const xss = require('xss');

const REGEX = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/; // Lowercase, uppercase, number

const UsersService = {
  hasUserWithUserName(db, user_name) {
    return db
      .from('tv_users')
      .where( {user_name} )
      .first()
      .then(user => !!user);
  },

  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('tv_users')
      .returning('*')
      .then(rows => rows[0]);
  },

  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX.test(password)) {
      return 'Password must contain at least one upper case, lower case, and number character';
    }
    return null;
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  serializeUser(user) {
    return {
      id: user.id,
      user_name: xss(user.user_name),
      full_name: xss(user.full_name),
      password: xss(user.password)
    };
  }
};

module.exports = UsersService;