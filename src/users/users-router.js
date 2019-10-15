const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter
  .post('/', jsonParser, (req,res,next) => {
    const { password, user_name, full_name } = req.body;

    if(!password) {
      return res.status(400).json({error: 'Missing password in request body'});
    }
    if(!user_name) {
      return res.status(400).json({error: 'Missing user_name in request body'});
    }
    if(!full_name) {
      return res.status(400).json({error: 'Missing full_name in request body'});
    }

    const passwordError = UsersService.validatePassword(password);

    if(passwordError) {
      return res.status(400).json( {error: passwordError} );
    }

    const db = req.app.get('db');
    UsersService.hasUserWithUserName(db, user_name)
      .then(userExists => {
        if(userExists) {
          return res.status(400).json( {error: 'Username already taken'} );
        }
        return UsersService.hashPassword(password)
          .then(hash => {
            const newUser = {
              user_name,
              password: hash,
              full_name
            };

            return UsersService.insertUser(db, newUser)
              .then(user => {
                return res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `${user.id}`))
                  .json(UsersService.serializeUser(user));
              });
          });
      })
      .catch(next);
  });

module.exports = usersRouter;