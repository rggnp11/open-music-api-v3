const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this.pool = new Pool();
    this.collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = {
      text: `INSERT INTO playlists
      (id, name, owner, created, updated)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      values: [id, name, owner, created, created],
    };

    const { rows } = await this.pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, users.id`,
      values: [owner],
    };

    const { rows } = await this.pool.query(query);

    return rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users on users.id = playlists.owner
      WHERE playlists.id = $1
      GROUP BY playlists.id, users.username`,
      values: [id],
    };

    const { rows, rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Id tidak ditemukan');
    }

    return rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rows, rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }

    return rows[0].id;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this.pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this.collaborationsService.verifyCollaborator(
          playlistId,
          userId,
        );
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
