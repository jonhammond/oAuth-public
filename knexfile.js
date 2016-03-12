// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://localhost/linkedin_auth',
    migrations: {
      directory: './src/server/db/migrations',
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/server/db/migrations',
      tableName: 'knex_migrations'
    }
  }

};

