import { ApolloClient, gql, InMemoryCache } from "@apollo/client/core";
import { YogaLink } from "@graphql-yoga/apollo-link";

import { SubscriptionRetryLink } from './link.js';

const link = new SubscriptionRetryLink().concat(new YogaLink({
  endpoint: "http://localhost:4000/graphql",
}))

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

const observable = client.subscribe({
  query: gql(/* GraphQL */`
    subscription {
      ping
    }
  `),
});

observable.subscribe(({ data }) => {
  console.log(data)
});
