import { pipeWith, PipeWithFns, curry } from 'ramda';

export const resolve = <T>(x: T): Promise<T> => Promise.resolve(x);

export const promiseAll = <T>(ps: Promise<T>[]): Promise<T[]> => Promise.all(ps);

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const pipeP = <I, O>(fns: PipeWithFns<I, Promise<O>>) =>
  pipeWith<I, Promise<O>>(
    (fn: (value: unknown) => unknown, res: unknown) =>
      res instanceof Promise ? res.then(fn) : fn(res),
    fns,
  );

export const tapP = <T>(fn: (x: T) => Promise<unknown>) => (data: T): Promise<unknown> =>
  fn(data).then(() => data);

export const errorLogTapP = (message: string) => (error: Error): Promise<Error> => {
  console.log(`${message}, ${error.message}, ${error.stack}`);
  return Promise.reject(error);
};

export const log = curry((tag, data) => console.log(`${tag}: ${JSON.stringify(data)}`));

export const serialMap = <I, O>(fn: (arg: I) => Promise<O>) => (xs: I[]): Promise<Promise<O>[]> =>
  xs.reduce(
    (responses: Promise<Promise<O>[]>, x) =>
      responses.then((rs: Promise<O>[]) => {
        const promise = fn(x);
        return promise
          .then(() => [...rs, promise])
          .catch((e) => [...rs, Promise.reject(e)]);
      }),
    Promise.resolve([]),
  );