const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this.pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = {
      text: `INSERT INTO songs
      (id, title, year, genre, performer, duration, album_id, created, updated)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      values: [
        id, title, year, genre, performer, duration, albumId, created, created,
      ],
    };

    const { rows } = await this.pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getSongs({ title, performer }) {
    const query = {
      text: `SELECT
        id,
        title,
        performer
      FROM songs
      WHERE LOWER(title) LIKE $1
      AND LOWER(performer) LIKE $2`,
      values: [
        `%${title ? title.toLowerCase() : ''}%`,
        `%${performer ? performer.toLowerCase() : ''}%`,
      ],
    };

    const { rows } = await this.pool.query(query);
    return rows;
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: `SELECT
        id,
        title,
        performer
      FROM songs
      WHERE album_id = $1`,
      values: [albumId],
    };

    const { rows } = await this.pool.query(query);
    return rows;
  }

  async getSongById(id) {
    const query = {
      text: `SELECT
        id,
        title,
        year,
        genre,
        performer,
        duration
      FROM songs
      WHERE id = $1`,
      values: [id],
    };

    const { rows, rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return rows[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const updated = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const query = {
      text: `UPDATE songs SET
        title = $2,
        year = $3,
        genre = $4,
        performer = $5,
        duration = $6,
        album_id = $7,
        updated = $8
      WHERE id = $1
      RETURNING id`,
      values: [id, title, year, genre, performer, duration, albumId, updated],
    };

    const { rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
