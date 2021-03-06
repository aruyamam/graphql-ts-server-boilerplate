module.exports = [
   {
      name: 'development',
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      synchronize: true,
      logging: true,
      dropSchema: true,
      entities: ['src/entity/**/*.ts'],
      migrations: ['src/migration/**/*.ts'],
      subscribers: ['src/subscriber/**/*.ts'],
      cli: {
         entitiesDir: 'src/entity',
         migrationsDir: 'src/migration',
         subscribersDir: 'src/subscriber'
      }
   },
   {
      name: 'test',
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASS,
      database: process.env.DB_TEST_NAME,
      synchronize: true,
      logging: false,
      dropSchema: true,
      entities: ['src/entity/**/*.ts'],
      migrations: ['src/migration/**/*.ts'],
      subscribers: ['src/subscriber/**/*.ts'],
      cli: {
         entitiesDir: 'src/entity',
         migrationsDir: 'src/migration',
         subscribersDir: 'src/subscriber'
      }
   }
];
