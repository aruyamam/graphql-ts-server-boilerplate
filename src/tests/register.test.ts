import { request } from 'graphql-request';

import { host } from './constants';
import { User } from '../entity/User';
import { createTypeormConn } from '../utils/createTypeormConn';

beforeAll(async () => {
   await createTypeormConn();
});

const email = 'bob@bob.com';
const password = 'dkfajfdakl';

const mutation = `
   mutation {
      register(email: "${email}", password: "${password}")
   }
`;

test('Register user', async () => {
   const response = await request(host, mutation);
   expect(response).toEqual({ register: true });

   const users = await User.find({ where: { email } });
   expect(users).toHaveLength(1);

   const user = users[0];
   expect(user.email).toEqual(email);
   expect(user.password).not.toEqual(password);
});

// use a test database
// drop all data once the test is over
// when I run yarn test it also starts the server
