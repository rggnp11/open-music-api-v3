const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const ClientError = require('../../exceptions/ClientError');

class PlaylistSongsService {
  constructor() {
    this.pool = new Pool();
  }

  async addPlaylistSong({ playlistId, songId }) {
    const id = `playlist_song-${nanoid(16)}`;
    const created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = {
      text: `INSERT INTO playlist_songs
      (id, playlist_id, song_id, created, updated)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      values: [id, playlistId, songId, created, created],
    };

    const { rows } = await this.pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    return rows[0].id;
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM playlist_songs
      LEFT JOIN songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1
      GROUP BY songs.id`,
      values: [playlistId],
    };

    const { rows } = await this.pool.query(query);

    return rows;
  }

  async deletePlaylistSongById({ playlistId, songId }) {
    const query = {
      text: `DELETE FROM playlist_songs
      WHERE playlist_id = $1
      AND song_id = $2
      RETURNING id`,
      values: [playlistId, songId],
    };

    const { rows, rowCount } = await this.pool.query(query);

    if (!rowCount) {
      throw new ClientError(
        'Lagu gagal dihapus dari playlist. Id tidak ditemukan',
      );
    }

    return rows[0].id;
  }
}

module.exports = PlaylistSongsService;
