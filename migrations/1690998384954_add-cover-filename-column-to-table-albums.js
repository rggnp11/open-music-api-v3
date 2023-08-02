exports.up = (pgm) => {
  pgm.addColumn('albums', {
    cover_filename: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'cover_filename');
};
