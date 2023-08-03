const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {
    albumsService,
    songsService,
    likesService,
    storageService,
    validator,
  }) => {
    const albumsHandler = new AlbumsHandler(
      albumsService,
      songsService,
      likesService,
      storageService,
      validator,
    );
    server.route(routes(albumsHandler));
  },
};
