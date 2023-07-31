class CollaborationsHandler {
  constructor(
    collaborationsService,
    playlistsService,
    usersService,
    validator,
  ) {
    this.collaborationsService = collaborationsService;
    this.playlistsService = playlistsService;
    this.usersService = usersService;
    this.validator = validator;
  }

  async postCollaborationHandler(request, h) {
    this.validator.validatePostCollaborationPayloadSchema(request.payload);
    const { userId: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this.usersService.getUserById(userId);
    const collaborationId = await this.collaborationsService.addCollaboration(
      request.payload,
    );

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: { collaborationId },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this.validator.validateDeleteCollaborationPayloadSchema(request.payload);
    const { userId: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this.usersService.getUserById(userId);
    await this.collaborationsService.deleteCollaborationById(request.payload);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
