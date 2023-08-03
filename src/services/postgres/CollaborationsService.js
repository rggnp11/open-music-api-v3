const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const ClientError = require('../../exceptions/ClientError');

class CollaborationsService {
  constructor() {
    this.pool = new Pool();
  }

  async addCollaboration({ playlistId, userId }) {
    const id = `collaboration-${nanoid(16)}`;
    const created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = {
      text: `INSERT INTO collaborations
      (id, playlist_id, user_id, created, updated)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      values: [id, playlistId, userId, created, created],
    };

    const { rows } = await this.pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    return rows[0].id;
  }

  async deleteCollaborationById({ playlistId, userId }) {
    const query = {
      text: `DELETE FROM collaborations
      WHERE playlist_id = $1
      AND user_id = $2
      RETURNING id`,
      values: [playlistId, userId],
    };

    const { rows, rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new ClientError('Kolaborasi gagal dihapus. Id tidak ditemukan');
    }

    return rows[0].id;
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: `SELECT id
      FROM collaborations
      WHERE playlist_id = $1 AND user_id = $2`,
      values: [playlistId, userId],
    };

    const { rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationsService;
