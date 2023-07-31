class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this.authenticationsService = authenticationsService;
    this.usersService = usersService;
    this.tokenManager = tokenManager;
    this.validator = validator;
  }

  async postAuthenticationHandler(request, h) {
    this.validator.validatePostAuthenticationPayload(request.payload);

    const userId = await this.usersService.verifyUserCredential(
      request.payload,
    );

    const accessToken = this.tokenManager.generateAccessToken({ userId });
    const refreshToken = this.tokenManager.generateRefreshToken({ userId });

    this.authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    this.validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this.authenticationsService.verifyRefreshToken(refreshToken);
    const { userId } = this.tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this.tokenManager.generateAccessToken({ userId });

    const response = h.response({
      status: 'success',
      message: 'Access token berhasil diperbarui',
      data: {
        accessToken,
      },
    });
    response.code(200);
    return response;
  }

  async deleteAuthenticationHandler(request, h) {
    this.validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this.authenticationsService.verifyRefreshToken(refreshToken);
    await this.authenticationsService.deleteRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = AuthenticationsHandler;
