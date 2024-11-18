# Executor Link issue reproduction

To summarise, subscriptions (`text/event-stream` requests) stay open despite the underlying observer having been closed.
We've got short-lived access tokens, so need to restart subscriptions hourly, we stacks up subscriptions on our services.

## To reproduce

* Install deps: `npm i`
* Start the server: `npm run server`
* Start the client: `npm run client`
* Observe the console/network tab:
  * The console will log ping: 0, up to 3
  * The network tab will hold the subscription open until message 4

## Root cause

The async iterator which handles the closure of the observer needs to wait until another message before closing:
https://github.com/ardatan/graphql-tools/blob/master/packages/executors/apollo-link/src/index.ts#L22

I've hit this before, and basically it needs some way to exit the function before another result comes in (abort signals or something).
