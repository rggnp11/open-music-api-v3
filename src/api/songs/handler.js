class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
  }

  async postSongHandler(request, h) {
    this.validator.validateSongPayload(request.payload);

    const newSongId = await this.service.addSong(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId: newSongId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
    const songs = await this.service.getSongs(request.query);

    const response = h.response({
      status: 'success',
      data: {
        songs,
      },
    });
    response.code(200);
    return response;
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const songList = await this.service.getSongById(id);

    const response = h.response({
      status: 'success',
      data: {
        song: songList,
      },
    });
    response.code(200);
    return response;
  }

  async putSongByIdHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    const { id } = request.params;

    await this.service.editSongById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil diubah',
    });
    response.code(200);
    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    await this.service.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = SongsHandler;
