const TvService = {
  getAllTvShows(db) {
    return db
      .select('*')
      .from('tv_table');
  },

  getTvShowById(db,id) {
    return db
      .select('*')
      .from('tv_table')
      .where( {id} )
      .first();
  },
  
  //Getting all the SHOWS per STATUS
  getAllPlanningToWatchShows(db) {
    return db
      .select('*')
      .from('tv_table')
      .where('status', 'Planning to Watch');
  },

  getAllCurrentlyWatchingShows(db) {
    return db
      .select('*')
      .from('tv_table')
      .where( {status: 'Currently Watching'} );
  },

  getAllCompletedShows(db) {
    return db
      .select('*')
      .from('tv_table')
      .where( {status: 'Completed'} );
  },

  //Getting all the SHOW by ID per STATUS
  getPlanningToWatchShowById (db,id) {
    return db
      .select('*')
      .from('tv_table')
      .where( {status: 'Planning to Watch'})
      .where( {id} )
      .first();
  },

  getCurrentlyWatchingShowById (db,id) {
    return db
      .select('*')
      .from('tv_table')
      .where( {status: 'Currently Watching'})
      .where( {id} )
      .first();
  },

  getCompletedShowById (db,id) {
    return db
      .select('*')
      .from('tv_table')
      .where( {status: 'Completed'})
      .where( {id} )
      .first();
  },

  //Other misc. actions
  postTvShow(db,newShow) {
    return db
      .insert(newShow)
      .into('tv_table')
      .returning('*')
      .then(res => res[0]);
  },

  deleteTvShow(db,id) {
    return db
      .from('tv_table')
      .where( {id} )
      .delete();
  },

  updateTvShow(db, id, newShowFields) {
    return db
      .update(newShowFields)
      .from('tv_table')
      .where( {id} );
  }
};

module.exports = TvService;