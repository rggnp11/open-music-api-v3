const Joi = require('joi');

const PostCollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required().max(50),
});

const DeleteCollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required().max(50),
});

module.exports = {
  PostCollaborationPayloadSchema, DeleteCollaborationPayloadSchema,
};
