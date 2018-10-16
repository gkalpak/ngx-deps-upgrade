import * as minimist from 'minimist';
import {resolve} from 'path';

// TS can't cope with files outside the `rootDir`.
// tslint:disable-next-line: no-var-requires
const pkg = require('../../../package.json');

export interface IParsedArgs {
  [key: string]: unknown;
}

const ghTokenNameGeneric = 'GITHUB_ACCESS_TOKEN';
const ghTokenNamePackage = `${ghTokenNameGeneric}__${pkg.name.replace(/\W/g, '_')}`;
const [, thisOriginOwner, thisOriginName] =
  /^(?:git\+)?https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/)?$/.exec(pkg.repository.url)!;

export const GH_TOKEN_NAMES = [ghTokenNamePackage, ghTokenNameGeneric];
export const GH_TOKEN = GH_TOKEN_NAMES.
  reduce<string | undefined>((token, name) => token || process.env[name], undefined);

export const PARSED_ARGS: IParsedArgs = minimist(process.argv);
export const REPO_INFO = {
  ng: {
    defaultBranch: 'master',
    originOwner: thisOriginOwner,
    upstreamName: 'angular',
    upstreamOwner: 'angular',
  },
  own: {
    originName: thisOriginName,
    originOwner: thisOriginOwner,
  },
};
export const ROOT_DIR = resolve(__dirname, '../..');
export const USER_INFO = {
  email: 'kalpakas.g@gmail.com',
  name: 'George Kalpakas',
};
export const VERSION_STAMP = `${pkg.name} v${pkg.version}`;
