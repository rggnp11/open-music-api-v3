class AlbumsHandler {
  constructor(albumsService, songsService, validator) {
    this.albumsService = albumsService;
    this.songsService = songsService;
    this.validator = validator;
  }

  async postAlbumHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);

    const newAlbumId = await this.albumsService.addAlbum(request.payload);
    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId: newAlbumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this.albumsService.getAlbumById(id);
    const songs = await this.songsService.getSongsByAlbumId(id);
    album.songs = songs;

    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this.albumsService.editAlbumById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil diubah',
    });
    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this.albumsService.deleteAlbumById(id);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
