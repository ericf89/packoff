import delay from 'delay';

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

export const backoffWithMs = ({
  baseDelayTime = 1000,
  currentAttempt,
  jitter = true,
  cap = 20_000,
}) => {
  if (!baseDelayTime) throw new Error('packoff: Base delay time must be > 0');

  if (!Number.isInteger(currentAttempt))
    throw new Error('packoff: Current attempt must be a integer to calc delay');

  const delayMs = jitter
    ? getRandomInt(
        Math.min(baseDelayTime * getRandomInt(2 ** currentAttempt), cap),
      )
    : Math.min(baseDelayTime * getRandomInt(2 ** currentAttempt), cap);

  return [delay(delayMs), delayMs];
};

export const backoffMs = (args) => backoffWithMs(args)[1];
export const backoff = (args) => backoffWithMs(args)[0];
export const setupBackoff = (args) => (currentAttempt) =>
  backoff({ ...args, currentAttempt });
export const setupBackoffWithMs = (args) => (currentAttempt) =>
  backoffWithMs({ ...args, currentAttempt });

export const tryUntilResolved =
  (func, backoffArgs) =>
  async (...funcArgs) => {
    let currentAttempt = backoffArgs?.currentAttempt || 0;
    const thisBackoff = setupBackoff(backoffArgs);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const result = await func(...funcArgs);
        return result;
      } catch (e) {
        currentAttempt += 1;
        if (currentAttempt < (backoffArgs?.attemptLimit || 10)) {
          await thisBackoff(currentAttempt);
        } else {
          throw e;
        }
      }
    }
  };
