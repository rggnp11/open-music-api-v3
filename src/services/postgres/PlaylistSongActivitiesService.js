const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongActivitiesService {
  constructor() {
    this.pool = new Pool();
  }

  async addPlaylistSongActivity({
    playlistId,
    songId,
    userId,
    action,
  }) {
    const time = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = {
      text: `INSERT INTO playlist_song_activities
      (playlist_id, song_id, user_id, action, time, updated)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      values: [playlistId, songId, userId, action, time, time],
    };

    const { rows } = await this.pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Aktivitas playlist gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `SELECT
        users.username,
        songs.title,
        playlist_song_activities.action,
        playlist_song_activities.time
      FROM playlist_song_activities
      LEFT JOIN users ON users.id = playlist_song_activities.user_id
      LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_id = $1
      GROUP BY playlist_song_activities.id, users.id, songs.id`,
      values: [playlistId],
    };

    const { rows } = await this.pool.query(query);

    return rows;
  }
}

module.exports = PlaylistSongActivitiesService;
