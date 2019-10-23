const express = require('express');
const TvService = require('./tv-service');
const xss = require('xss');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');

const tvRouter = express.Router();
const jsonParser = express.json();

const serializeShow = show => ({
  id: show.id,
  tv_title: xss(show.tv_title),
  status: show.status,
  season_number: show.season_number,
  episode_number: show.episode_number,
  rating: Number(show.rating),
  genre: show.genre,
  description: xss(show.description),
  review: xss(show.review),
  user_id: show.user_id
});

tvRouter
  .route('/all')
  .get(requireAuth, (req,res,next) => {
    const db = req.app.get('db');    
    TvService.getTvShowsByUserId(db, req.user.id)
      .then(shows => {
        return res.status(200).json(shows.map(serializeShow));
      })
      .catch(next);
  })
  .post(requireAuth, jsonParser, (req,res,next) => {
    const { tv_title, status, season_number, episode_number, rating, genre, description, review } = req.body;
    const ratingNum = Number(rating);

    if(!tv_title) {
      return res.status(400).json( {error: 'TV show name is required'} );
    }
    if(!status) {
      return res.status(400).json( {error: 'Status is required'} );
    }

    if(season_number) {
      if(!Number.isInteger(season_number) && Number(season_number) <= 0) {
        return res.status(400).json( {error: 'Season Number must be a whole number greater than 0'});
      }
    }
    if(episode_number) {
      if(!Number.isInteger(episode_number) && Number(episode_number) <= 0) {
        return res.status(400).json( {error: 'Episode Number must be a whole number greater than 0'});
      }
    }
    if(rating) {
      if(!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json( {error: 'Rating must be a whole number between 1-5'}); 
      }
    }

    const db = req.app.get('db');
    const newShow = { tv_title, status, season_number, episode_number, rating, genre, description, review };

    newShow.user_id = req.user.id;

    TvService.postTvShow(db,newShow)
      .then(show => {
        return res
          .status(201)
          .location(path.posix.join(req.originalUrl,`/${show.id}`))
          .json(serializeShow(show));
      })
      .catch(next);
  });

tvRouter
  .route('/all/:id')
  .all(requireAuth)
  .all((req,res,next) => {
    const db = req.app.get('db');
    const id = req.params.id;

    TvService.getSpecificShowByUserId(db,id,req.user.id)
      .then(show => {
        if(!show) {
          return res.status(404).send({error: 'TV show not found'});
        }
        res.show = show;
        next();
      })
      .catch(next);
  })
  .get((req,res,next) => {
    return res.status(200).json(serializeShow(res.show));
  })
  .delete((req,res,next) => {
    const db = req.app.get('db');
    const id = req.params.id;

    TvService.deleteTvShow(db,id)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req,res,next) => {
    const { tv_title, status, season_number, episode_number, rating, genre, description, review } = req.body;
    const newShowFields =  { tv_title, status, season_number, episode_number, rating, genre, description, review };
    const db = req.app.get('db');
    const id = req.params.id;

    const numberOfValues = Object.values(newShowFields).filter(Boolean).length;
    if(numberOfValues === 0) {
      return res.status(400).json( {error: 'Request body must contain tv_title, status, season_number, episode_number, rating, genre, description, or review'});
    }

    TvService.updateTvShow(db,id,newShowFields)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = tvRouter;