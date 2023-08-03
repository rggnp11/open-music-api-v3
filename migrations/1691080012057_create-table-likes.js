exports.up = (pgm) => {
  pgm.createTable(
    'likes',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      album_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      user_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      created: {
        type: 'TIMESTAMP',
        notNull: true,
      },
      updated: {
        type: 'TIMESTAMP',
        notNull: true,
      },
    },
  );

  pgm.addConstraint(
    'likes',
    'fk_likes.album_id_albums.id',
    'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'likes',
    'fk_likes.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'likes',
    'uk_likes.album_id_likes.user_id',
    'UNIQUE (album_id, user_id)',
  );
};

exports.down = (pgm) => {
  pgm.dropconstraint(
    'likes',
    'uk_likes.album_id_likes.user_id',
  );

  pgm.dropConstraint(
    'likes',
    'fk_likes.user_id_users.id',
  );

  pgm.dropConstraint(
    'likes',
    'fk_likes.album_id_albums.id',
  );

  pgm.dropTable('likes');
};
