BEGIN;

TRUNCATE
  tv_table,
  tv_users
  RESTART IDENTITY CASCADE;

INSERT INTO tv_users (user_name, full_name, password)
VALUES
  ('user1', 'User One', '123456'),
  ('user2', 'User Two', '123456'),
  ('user3', 'User Three', '123456'),
  ('user4', 'User Four', '123456');


INSERT INTO tv_table (tv_title, status, season_number, episode_number, rating, genre, description, review, user_id)
VALUES
  ('Stranger Things', 'Completed', 2, 10, '4', 'Sci-Fi', '', '', 1),
  ('Entry 2', 'Planning to Watch', 2, 10, '4', 'Action', '', '', 2),
  ('Entry 3', 'Completed', 2, 10, '4', 'Comedy', '', '', 3),
  ('Entry 4', 'Currently Watching', 2, 10, '4', 'Fantasy', '', '', 4);

COMMIT;
