const TvService = {
  getTvShowsByUserId(db, userId) {
    return db
      .select('*')
      .from('tv_table')
      .where( { user_id: userId } );
  },

  getSpecificShowByUserId(db,id,user_id) {
    return db
      .select('*')
      .from('tv_table')
      .where( {id, user_id} )
      .first();
  },

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
  },
  

  //Misc. queries: 
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

  filterBySearchName(db,userId,searchTerm) {
    return db
      .select('*')
      .from('tv_table')
      .where( {user_id: userId })
      .andWhere('tv_title', 'ilike', `%${searchTerm}%`);
  }
};

module.exports = TvService;