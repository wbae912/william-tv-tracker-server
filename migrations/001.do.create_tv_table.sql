CREATE TYPE star_rating as ENUM (
  '',
  '1',
  '2',
  '3',
  '4',
  '5'
);

CREATE TYPE genre_type as ENUM (
  'N/A',
  'Action',
  'Animated',
  'Comedy',
  'Documentary',
  'Drama',
  'Educational',
  'Fantasy',
  'Horror',
  'Mystery',
  'Reality',
  'Sitcom',
  'Sci-Fi',
  'Thriller',
  'Variety'
);

CREATE TYPE category as ENUM (
  'Planning to Watch',
  'Currently Watching',
  'Completed'
);

CREATE TABLE tv_table (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  tv_title TEXT NOT NULL,
  status category,
  season_number INTEGER DEFAULT 1,
  episode_number INTEGER DEFAULT 1,
  rating star_rating,
  genre genre_type,
  description TEXT,
  review TEXT
);