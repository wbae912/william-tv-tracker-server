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
  }
};

module.exports = TvService;