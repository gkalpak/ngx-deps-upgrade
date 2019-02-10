import {resolve as resolvePath} from 'path';
import 'source-map-support/register';
import {sleep} from '../lib/utils/common-utils';


export const IS_WINDOWS = (process.platform === 'win32');

export const ROOT_DIR = resolvePath(__dirname, '..');

export const reversePromise = (promise: Promise<unknown>): Promise<unknown> =>
  promise.then(val => Promise.reject(val), err => err);

export const tickAsPromised = (): Promise<void> => sleep(0);
