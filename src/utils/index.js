const mapAlbumToModel = ({
  id,
  name,
  cover_filename,
}) => ({
  id,
  name,
  coverUrl: cover_filename,
});

module.exports = { mapAlbumToModel };
