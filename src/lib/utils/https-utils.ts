import {request, RequestOptions} from 'https';
import {parse, Url} from 'url';
import {Logger} from './logger';

export type IJsonResponse = Array<unknown> | {[key: string]: unknown};

export class HttpsUtils {
  constructor(private readonly logger: Logger) {
  }

  public get(url: string | Url, options?: RequestOptions): Promise<string> {
    return this.request('get', url, options);
  }

  public post(url: string | Url, payload?: string, options?: RequestOptions): Promise<string> {
    return this.request('post', url, options, payload);
  }

  public request(method: string, url: string | Url, options: RequestOptions = {}, payload = ''): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Do not use the `request(url, options, cb)` signature,
      // to remain compatible with versions older than 10.9.0.
      const urlObj  = (typeof url === 'string') ? parse(url) : url;
      const combinedOptions = {...urlObj, ...options, method};

      this.logger.debug(
          `${method.toUpperCase()}: ${urlObj.href} ` +
          `(options: {${Object.keys(options).join(', ')}}, payload: '${payload}')`);

      let responseText = '';
      request(combinedOptions, res => res.
          on('error', reject).
          on('data', d => responseText += d).
          on('end', () => (res.statusCode && (200 <= res.statusCode) && (res.statusCode < 300)) ?
            resolve(responseText) :
            reject(`Request to '${urlObj.href}' failed (status: ${res.statusCode}):\n${responseText}`))).
        on('error', reject).
        end(payload);
    });
  }

  public requestAsJson<T extends IJsonResponse>(
      method: string,
      url: string | Url,
      options: RequestOptions = {},
      payload: string | object = '',
  ): Promise<T> {
    payload = (typeof payload !== 'string') ? JSON.stringify(payload) : payload;
    return this.
      request(method, url, options, payload).
      then(responseText => this.toJson<T>(responseText));
  }

  private toJson<T extends IJsonResponse>(responseText: string): T {
    try {
      return JSON.parse(responseText);
    } catch (err) {
      this.logger.error(`Response:\n${responseText}`);
      throw err;
    }
  }
}
