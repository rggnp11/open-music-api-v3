const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const InternalServerError = require('../../exceptions/InternalServerError');

class AlbumsService {
  constructor() {
    this.pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = {
      text: `INSERT INTO albums (id, name, year, created, updated)
      VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      values: [id, name, year, created, created],
    };

    const { rows } = await this.pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT
        id,
        name,
        cover_filename as coverfilename
      FROM albums WHERE id = $1`,
      values: [id],
    };

    const { rows, rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const updated = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const query = {
      text: `UPDATE albums SET
        name = $2,
        year = $3,
        updated = $4
      WHERE id = $1
      RETURNING id`,
      values: [id, name, year, updated],
    };

    const { rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async setAlbumCoverfilenameById(id, coverFilename) {
    const updated = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const query = {
      text: `UPDATE albums SET
        cover_filename = $1,
        updated = $2
      WHERE id = $3
      RETURNING id`,
      values: [coverFilename, updated, id],
    };

    const { rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new InternalServerError('Sampul gagal disimpan');
    }
  }
}

module.exports = AlbumsService;
