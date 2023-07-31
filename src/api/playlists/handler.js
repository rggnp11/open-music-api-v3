class PlaylistsHandler {
  constructor(
    playlistsService,
    songsService,
    playlistSongsService,
    playlistSongActivitiesService,
    validator,
  ) {
    this.playlistsService = playlistsService;
    this.songsService = songsService;
    this.playlistSongsService = playlistSongsService;
    this.activitiesService = playlistSongActivitiesService;
    this.validator = validator;
  }

  async postPlaylistHander(request, h) {
    this.validator.validatePostPlaylistPayloadSchema(request.payload);
    const { name } = request.payload;
    const { userId: credentialId } = request.auth.credentials;

    const playlistId = await this.playlistsService.addPlaylist(
      { name, owner: credentialId },
    );

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHander(request) {
    const { userId: credentialId } = request.auth.credentials;

    const playlists = await this.playlistsService.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHander(request) {
    const { id } = request.params;
    const { userId: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistOwner(id, credentialId);
    await this.playlistsService.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }

  async postPlaylistSongHander(request, h) {
    this.validator.validatePostPlaylistSongPayloadSchema(request.payload);
    const { userId: credentialId } = request.auth.credentials;
    const { id } = request.params;
    const { songId } = request.payload;

    await this.playlistsService.verifyPlaylistAccess(id, credentialId);
    await this.songsService.getSongById(songId);

    await this.playlistSongsService.addPlaylistSong(
      { playlistId: id, songId },
    );

    await this.activitiesService.addPlaylistSongActivity({
      playlistId: id,
      songId,
      userId: credentialId,
      action: 'add',
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHander(request) {
    const { userId: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this.playlistsService.verifyPlaylistAccess(id, credentialId);

    const playlist = await this.playlistsService.getPlaylistById(id);
    const songs = await this.playlistSongsService.getPlaylistSongs(id);
    playlist.songs = songs;

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongByIdHander(request) {
    const { userId: credentialId } = request.auth.credentials;
    const { id } = request.params;
    const { songId } = request.payload;

    await this.playlistsService.verifyPlaylistAccess(id, credentialId);
    await this.playlistSongsService.deletePlaylistSongById(
      { playlistId: id, songId },
    );

    await this.activitiesService.addPlaylistSongActivity({
      playlistId: id,
      songId,
      userId: credentialId,
      action: 'delete',
    });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistSongActivitiessHander(request) {
    const { userId: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this.playlistsService.verifyPlaylistAccess(id, credentialId);

    const rows = await this.activitiesService.getPlaylistSongActivities(id);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities: rows,
      },
    };
  }
}

module.exports = PlaylistsHandler;
