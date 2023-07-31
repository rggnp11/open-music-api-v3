exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
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
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
