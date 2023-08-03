const log = require('npmlog');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const ClientError = require('../../exceptions/ClientError');

class LikesService {
  constructor() {
    this.pool = new Pool();
  }

  async addLike({ albumId, userId }) {
    const id = `like-${nanoid(16)}`;
    const created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = {
      text: `INSERT INTO likes
      (id, album_id, user_id, created, updated)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      values: [id, albumId, userId, created, created],
    };

    try {
      const { rowCount } = await this.pool.query(query);

      if (!rowCount) {
        throw new ClientError('Like gagal ditambahkan');
      }
    } catch (error) {
      throw new ClientError('Like gagal ditambahkan');
    }
  }

  async deleteLike({ albumId, userId }) {
    const query = {
      text: `DELETE FROM likes
      WHERE album_id = $1
      AND user_id = $2
      RETURNING id`,
      values: [albumId, userId],
    };

    const { rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new ClientError('Like gagal dihapus. Id tidak ditemukan');
    }
  }

  async getLikesCount(albumId) {
    const query = {
      text: `SELECT COUNT(id)
      FROM likes WHERE album_id = $1`,
      values: [albumId],
    };

    const { rows } = await this.pool.query(query);
    log.info(null, rows);

    if (rows[0]) {
      return rows[0].count;
    }

    return 0;
  }
}

module.exports = LikesService;
