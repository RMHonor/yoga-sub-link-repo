import { ApolloLink, Observable } from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind } from "graphql";


class RetryableOperation {
  retryCount = 0;

  constructor(
    observer,
    operation,
    forward,
  ) {
    this.observer = observer;
    this.operation = operation;
    this.forward = forward;
    this.try();

    // fake a token expiring with an interval
    this.timerID = setInterval(() => {
      console.log("reconnecting");
      this.cancel();
      this.try();
    }, 10000)
  }

  cancel = () => {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    delete this.subscription;
  };

  close = () => {
    console.log("closing");
    clearInterval(this.timerID);
    this.cancel();
  };

  try = () => {
    this.subscription = this.forward(this.operation).subscribe({
      next: this.observer.next.bind(this.observer),
      error: this.observer.error.bind(this.observer),
      complete: this.observer.complete.bind(this.observer),
    });
  };
}

export class SubscriptionRetryLink extends ApolloLink {
  request(operation, nextLink) {
    const definition = getMainDefinition(operation.query);

    // for non-subscription operations, move onto the next link
    const subscriptionOperation =
      definition.kind === Kind.OPERATION_DEFINITION && definition.operation === "subscription";

    if (!subscriptionOperation) return nextLink(operation);

    return new Observable((observer) => {
      const retryable = new RetryableOperation(observer, operation, nextLink);

      return () => {
        retryable.close();
      };
    });
  }
}
