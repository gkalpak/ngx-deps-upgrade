import {OutgoingHttpHeaders, RequestOptions} from 'http';
import {stripIndentation} from './common-utils';
import {GH_TOKEN_NAMES, VERSION_STAMP} from './constants';
import {HttpsUtils, IJsonResponse} from './https-utils';
import {Logger} from './logger';


export interface IRequestParams {
  [key: string]: string | number | undefined;
}

export class GithubUtils {
  private static readonly BASE_URL = 'https://api.github.com/';
  private readonly requestHeaders = {
    Authorization: this.token && `token ${this.token}`,
    'User-Agent': `${VERSION_STAMP} | Node ${process.version}`,
  };
  private showTokenWarning = !this.token;

  constructor(
      private readonly logger: Logger,
      private readonly httpsUtils: HttpsUtils,
      private readonly token: string = '',
  ) {
  }

  public delete<T extends IJsonResponse>(
      pathname: string,
      params?: IRequestParams,
      extraHeaders?: OutgoingHttpHeaders,
  ): Promise<T> {
    const partialUrl = this.buildPartialUrl(pathname, params);
    return this.request<T>('delete', partialUrl, undefined, extraHeaders);
  }

  public get<T extends IJsonResponse>(
      pathname: string,
      params?: IRequestParams,
      extraHeaders?: OutgoingHttpHeaders,
  ): Promise<T> {
    const partialUrl = this.buildPartialUrl(pathname, params);
    return this.request<T>('get', partialUrl, undefined, extraHeaders);
  }

  // In GitHub API paginated requests, page numbering is 1-based. (https://developer.github.com/v3/#pagination)
  public getPaginated<T = unknown>(
      pathname: string,
      baseParams?: IRequestParams,
      extraHeaders?: OutgoingHttpHeaders,
      currentPage = 1,
  ): Promise<T[]> {
    const perPage = 100;
    const params = {
      ...baseParams,
      page: currentPage,
      per_page: perPage,
    };

    return this.get<T[]>(pathname, params, extraHeaders).
      then(items => (items.length < perPage) ?
        items :
        this.getPaginated<T>(pathname, baseParams, extraHeaders, currentPage + 1).
          then(moreItems => [...items, ...moreItems]));
  }

  public patch<T extends IJsonResponse>(
      pathname: string,
      params?: IRequestParams,
      payload?: object,
      extraHeaders?: OutgoingHttpHeaders,
  ): Promise<T> {
    const partialUrl = this.buildPartialUrl(pathname, params);
    return this.request<T>('patch', partialUrl, payload, extraHeaders);
  }

  public post<T extends IJsonResponse>(
      pathname: string,
      params?: IRequestParams,
      payload?: object,
      extraHeaders?: OutgoingHttpHeaders,
  ): Promise<T> {
    const partialUrl = this.buildPartialUrl(pathname, params);
    return this.request<T>('post', partialUrl, payload, extraHeaders);
  }

  public request<T extends IJsonResponse>(
      method: string,
      partialUrl: string,
      payload?: string | object,
      extraHeaders?: OutgoingHttpHeaders,
  ): Promise<T> {
    const {url, options} = this.prepareRequest(partialUrl, extraHeaders);
    return this.httpsUtils.requestAsJson<T>(method, url, options, payload);
  }

  public requestRaw(
      method: string,
      partialUrl: string,
      payload?: string,
      extraHeaders?: OutgoingHttpHeaders,
  ): Promise<string> {
    const {url, options} = this.prepareRequest(partialUrl, extraHeaders);
    return this.httpsUtils.request(method, url, options, payload);
  }

  private buildPartialUrl(pathname: string, params?: IRequestParams): string {
    const queryStr = params ? this.serializeParams(params) : '';
    const joiner = queryStr && '?';

    return `${pathname}${joiner}${queryStr}`;
  }

  private prepareRequest(
      partialUrl: string,
      extraHeaders?: OutgoingHttpHeaders,
  ): {url: string, options: RequestOptions} {
    const url = `${GithubUtils.BASE_URL}${partialUrl}`;
    const options = {headers: {...this.requestHeaders, ...extraHeaders}};

    if (this.showTokenWarning) {
      this.showTokenWarning = false;
      this.logger.warn(stripIndentation(`
        No GitHub access token found in environment variable ${GH_TOKEN_NAMES.join(' or ')}.
        Proceeding anonymously (and subject to rate-limiting)...
      `));
    }

    return {url, options};
  }

  private serializeParams(params: IRequestParams): string {
    return Object.keys(params).
      filter(key => params[key] != null).
      map(key => `${key}=${encodeURIComponent(String(params[key]))}`).
      join('&');
  }
}
