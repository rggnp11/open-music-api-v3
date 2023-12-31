const log = require('npmlog');

class AlbumsHandler {
  constructor(
    albumsService,
    songsService,
    likesService,
    storageService,
    validator,
  ) {
    this.albumsService = albumsService;
    this.songsService = songsService;
    this.likesService = likesService;
    this.storageService = storageService;
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
    if (album.coverfilename) {
      album.coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${encodeURIComponent(album.coverfilename)}`;
    } else {
      album.coverUrl = null;
    }
    delete album.coverfilename;

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

  async postAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;
    this.validator.validateAlbumCoverHeaders(cover.hapi.headers);

    const album = await this.albumsService.getAlbumById(id);
    const oldCoverFilename = album.coverfilename;
    const filename = await this.storageService.writeFile(cover, cover.hapi);
    try {
      await this.albumsService.setAlbumCoverfilenameById(id, filename);
      if (oldCoverFilename) {
        this.storageService.deleteFile(oldCoverFilename);
      }
    } catch {
      this.storageService.deleteFile(filename);
    }

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { userId: credentialId } = request.auth.credentials;

    await this.likesService.addLike({ albumId: id, userId: credentialId });

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { userId: credentialId } = request.auth.credentials;

    await this.likesService.deleteLike({ albumId: id, userId: credentialId });

    const response = h.response({
      status: 'success',
      message: 'Like berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async getAlbumLikeHandler(request, h) {
    const { id } = request.params;

    const likes = await this.likesService.getLikesCount(id);
    log.info(null, likes);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
