import {resolve as resolvePath} from 'path';
import 'source-map-support/register';


export const IS_WINDOWS = (process.platform === 'win32');

export const ROOT_DIR = resolvePath(__dirname, '..');

export function reversePromise(promise: Promise<any>): Promise<any> {
  return promise.then(val => Promise.reject(val), err => err);
}

export function tickAsPromised(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}
