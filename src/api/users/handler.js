class UsersHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
  }

  async postUserHandler(request, h) {
    this.validator.validateUserPayload(request.payload);

    const newUserId = await this.service.addUser(request.payload);

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId: newUserId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
