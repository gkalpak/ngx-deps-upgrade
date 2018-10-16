import {GH_TOKEN} from './constants';
import {GithubUtils} from './github-utils';
import {HttpsUtils} from './https-utils';
import {Logger, LogLevel} from './logger';

export const logger = new Logger(LogLevel.debug);
export const httpsUtils = new HttpsUtils(logger);
export const githubUtils = new GithubUtils(logger, httpsUtils, GH_TOKEN);
