### Packoff

##### Promise based backoff!

Packoff is a minimalist, promised based, [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff) lib. Given your current 'retry' attempt, it'll return a promise that you can `await` before attempting some operation again.

#### Installation

`npm i packoff`

#### Usage

The main backoff functions take an options object with the following arguments:

| Argument         | Default             | Description                                                                                                                                                                                               |
| ---------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseDelayTime`  | **none** (required) | This is the base amount of time (in milliseconds used to calculate the backoff delay.                                                                                                                     |
| `currentAttempt` | **none** (required) | The number of attempts tried so far. The higher this is, the longer the possible delay                                                                                                                    |
| `jitter`         | true                | With jitter, your backoff attempt delays will have a smoother curve. You normally want this. [Read this](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) for more info.        |
| `cap`            | 20000 (20 sec)      | This caps the max delay of your back off attempts. If you're going to repeatedly retry something over and over, you probably don't want your attempts to end up in the minute time frame... unless you do |

The simplest use case is when you have some async thing you want to try over and over until it works.

```js
import { backoff } from 'packoff';
import riskyBusiness from './async-risky-business';

const tryToDoSomeWork = () => {
  let isDone = false;
  let retries = 0;
  while(!isDone && retries < 10) {
    try {
      await riskyBusiness();
      console.log('success');
      isDone = true;
    } catch (e) {
      console.log('something went wrong, try again...');
      retries += 1;
      await backoff({ currentAttempt: retries, baseDelayTime: 1000 });
    }
  }
}
```

Optionally, if you want to setup some sort of base configuration, you can do that with setupBackoff.

```js
import { setupBackoff } from 'packoff';
import riskyBusiness from './async-risky-business';

const myBackoff = setupBackoff({ baseDelayTime: 1500, jitter: false });

const tryToDoSomeWork = () => {
  let isDone = false;
  let retries = 0;
  while(!isDone && retries < 10) {
    try {
      await riskyBusiness();
      console.log('success');
      isDone = true;
    } catch (e) {
      console.log('something went wrong, try again...');
      retries += 1;
      // Now you just need the attempt count;
      await myBackoff(retries);
    }
  }
}
```

Lastly, when debugging or for logging, it may be useful to know how long your retry is going to wait. There are additional `backoffWithMs` and `setupBackoffWithMs` functions that return an array instead of a promise. The first element is the delay promise, the second is the ms until that promise resolves;

```js
import { backoffWithMs } from 'packoff';

async function examp() {
  const [backoffPromise, ms] = backoffWithMs({
    baseDelayTime: 3000,
    currentAttempt: 2,
  });
  console.log(`Waiting ${ms} before continuing!`);
  await backoffPromise;
}
```
