import 'reflect-metadata';
import 'dotenv/config';
import { GraphQLServer } from 'graphql-yoga';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import * as RateLimit from 'express-rate-limit';
import * as RateLimitRedisStore from 'rate-limit-redis';
import * as passport from 'passport';
import { Strategy } from 'passport-google-oauth20';

import { redis } from './redis';
import { createTypeormConn } from './utils/createTypeormConn';
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/genSchema';
import { redisSessionPrefix } from './constants';
import { createTestConn } from './testUtils/createTestConn';
import { User } from './entity/User';
import { Connection } from 'typeorm';

const RedisStore = connectRedis(session);

export const startServer = async () => {
   if (process.env.NODE_ENV === 'test') {
      await redis.flushall();
   }

   const server = new GraphQLServer({
      schema: genSchema(),
      context: ({ request }) => ({
         redis,
         url: request.protocol + '://' + request.get('host'),
         session: request.session,
         req: request
      })
   });

   server.express.use(
      new RateLimit({
         store: new RateLimitRedisStore({
            client: redis
         }),
         windowMs: 15 * 60 * 1000, // 15 minutes
         max: process.env.NODE_ENV === 'test' ? 0 : 100 // limit each IP to 100 requests per windowMs
      })
   );

   server.express.use(
      session({
         store: new RedisStore({
            client: redis as any,
            prefix: redisSessionPrefix
         }),
         name: 'qid',
         secret: process.env.SESSION_SECRET as string,
         resave: false,
         saveUninitialized: false,
         cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
         }
      })
   );

   const cors = {
      credentials: true,
      origin:
         process.env.NODE_ENV === 'test'
            ? '*'
            : (process.env.FRONTEND_HOST as string)
   };

   server.express.get('/confirm/:id', confirmEmail);

   let connection: Connection;
   if (process.env.NODE_ENV === 'test') {
      connection = await createTestConn(true);
   } else {
      connection = await createTypeormConn();
   }

   passport.use(
      new Strategy(
         {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: 'http://localhost:4000/auth/google/callback'
         },
         async (_, __, profile, cb) => {
            // console.log(profile);
            const { id, emails } = profile;

            const query = connection
               .getRepository(User)
               .createQueryBuilder('user')
               .where('user.googleId = :id', { id });

            let email: string | null = null;

            if (emails) {
               email = emails[0].value;
               query.orWhere('user.email = :email', { email });
            }

            let user = await query.getOne();

            // this user need to be registered
            if (!user) {
               user = await User.create({
                  googleId: id,
                  email
               }).save();
            } else if (!user.googleId) {
               // merge account
               // we found user by email
               user.googleId = id;
               await user.save();
            } else {
               // we have a googleId
               // login
            }

            return cb(null, { id: user.id });
         }
      )
   );

   server.express.use(passport.initialize());

   server.express.get(
      '/auth/google',
      passport.authenticate('google', { scope: ['profile'] })
   );

   server.express.get(
      '/auth/google/callback',
      passport.authenticate('google', { session: false }),
      (req, res) => {
         (req.session as any).userId = req.user.id;
         // @todo redirect to frontend
         res.redirect('/');
      }
   );

   const app = await server.start({
      cors,
      port: process.env.NODE_ENV === 'test' ? 0 : 4000
   });
   console.log('Server is running on localhost:4000');

   return app;
};
