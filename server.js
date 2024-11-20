import { setTimeout } from 'node:timers/promises'
import { createServer } from 'node:http'

import { createSchema, createYoga } from 'graphql-yoga'

const yoga = createYoga({
  schema: createSchema({
    resolvers: {
      Subscription: {
        ping: {
          subscribe: async function* (_, { from }) {
            for (let i = 1; i < 120; i++) {
              await setTimeout(4000)
              yield { ping: i }
            }
          }
        }
      }
    },
    typeDefs: /* GraphQL */ `
      type Subscription {
        ping: Int
      }

      type Query {
        ping: Boolean
      }
    `
  }),
  maskedErrors: false,
  plugins: [
    {
      onSubscribe: () => {
        console.log('subscription operation started');

        return {
          onSubscribeResult: () => {
            return {
              onEnd: () => {
                console.log('subscription finished');
              },
            };
          },
        };
      },
    },
  ]
});

const server = createServer(yoga)
server.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql')
})
