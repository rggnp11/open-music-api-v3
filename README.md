# open-music-api-v2

Prerequisites:
- Node version 14.17.0 (managed by NVM/Node Version Manager, if possible).
- `.env` file that contains:
   - HOST=...
   - PORT=...
   - PGUSER=...
   - PGPASSWORD=...
   - PGDATABASE=...
   - PGHOST=...
   - PGPORT=...
   - ACCESS_TOKEN_KEY=c...
   - REFRESH_TOKEN_KEY=...
   - ACCESS_TOKEN_AGE=...

To use required Node version (in .nvmrc), run `nvm use` (if NVM is available).

To install dependencies, run `npm install`.

To run the server in production mode: `npm run start`.

To run the server in development mode: `npm run start-dev`.

To run ESLint: `npm run lint`.

To run database migration:
   - `npm run migrate create ‘<migration name>’` to create new migration file.
   - `npm run migrate up` to run up migration which has not been applied.
   - `npm run migrate down` to run down migration from current state.
   - `npm run migrate redo` to rerun previous migration (to run down migration, then up migration).

To generate a random string, run this code in Node REPL:

```
require('crypto').randomBytes(64).toString('hex');
.exit
```
