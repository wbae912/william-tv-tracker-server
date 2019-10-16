BEGIN;

TRUNCATE
  tv_table,
  tv_users
  RESTART IDENTITY CASCADE;

INSERT INTO tv_users (user_name, full_name, password)
VALUES
  ('user1', 'User One', '$2a$12$9tKHYmGLHA/9sGGhwPTvm.NPJ8CY2rbJqdLVt4NxQbxWuUcsnWA7G'),
  ('user2', 'User Two', '$2a$12$9tKHYmGLHA/9sGGhwPTvm.NPJ8CY2rbJqdLVt4NxQbxWuUcsnWA7G'),
  ('user3', 'User Three', '$2a$12$9tKHYmGLHA/9sGGhwPTvm.NPJ8CY2rbJqdLVt4NxQbxWuUcsnWA7G'),
  ('user4', 'User Four', '$2a$12$9tKHYmGLHA/9sGGhwPTvm.NPJ8CY2rbJqdLVt4NxQbxWuUcsnWA7G');


INSERT INTO tv_table (tv_title, status, season_number, episode_number, rating, genre, description, review, user_id)
VALUES
  ('Stranger Things', 'Completed', 2, 10, '4', 'Sci-Fi', '', '', 1),
  ('Smallville', 'Planning to Watch', 2, 10, '4', 'Action', '', '', 2),
  ('Friends', 'Completed', 2, 10, '4', 'Comedy', '', '', 3),
  ('Game of Thrones', 'Currently Watching', 2, 10, '4', 'Fantasy', '', '', 4);

COMMIT;
