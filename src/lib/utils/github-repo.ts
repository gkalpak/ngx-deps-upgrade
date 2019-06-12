import {stripIndentation} from './common-utils';
import {GithubUtils, IRequestParams} from './github-utils';
import {IJsonObject} from './https-utils';

export interface IFile extends IJsonObject {
  contents_url: string;
  filename: string;
  sha: string;
  status: 'added' | 'modified' | 'removed';
}

export interface IFileContents extends IJsonObject {
  content?: string;
  encoding?: 'base64';
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'dir' | 'file' | 'submodule';
}

export interface IIssue extends IJsonObject {
  html_url: string;
  number: number;
  state: 'closed' | 'open';
  title: string;
}

export interface IMilestone extends IJsonObject {
  number: number;
  title: string;
  description: string | null;
}

export interface IPullRequest extends IIssue {
  statuses_url: string;
}

export interface IPullRequestSearchParams extends IRequestParams {
  base?: string;  // E.g.: `<head-branch>`
  direction?: 'asc' | 'desc';  // Default: `asc`, unless `sort` is `undefined` or `created`
  head?: string;  // E.g.: `<head-owner>:<head-branch>`
  sort?: 'created' | 'long-running' | 'popularity' | 'updated';  // Default: `created`
  state?: 'all' | 'closed' | 'open';  // Default: `open`
}

export class GithubRepo {
  // tslint:disable: member-ordering
  private readonly baseUrl = `https://github.com/${this.owner}/${this.name}`;
  public readonly slug = `${this.owner}/${this.name}`;
  public readonly url = `${this.baseUrl}.git`;
  // tslint:enable: member-ordering

  constructor(private readonly githubUtils: GithubUtils, readonly owner: string, readonly name: string) {
  }

  public async addLabels(issueOrPrNumber: number, labels: string[], checkExist = true): Promise<void> {
    if (checkExist) {
      const availableLabelNames = await this.getAvailableLabelNames();
      const nonExistent = labels.filter(label => !availableLabelNames.includes(label));

      if (nonExistent.length > 0) {
        const nonExistentStr = nonExistent.map(label => `"${label}"`).join(', ');
        throw new Error(`No labels added. Refusing to add non-existent labels: ${nonExistentStr}`);
      }
    }

    const pathname = `repos/${this.owner}/${this.name}/issues/${issueOrPrNumber}/labels`;

    return this.githubUtils.
      post(pathname, undefined, labels).
      then(() => undefined);
  }

  public async comment(issueOrPrNumber: number, body: string): Promise<void> {
    const pathname = `repos/${this.owner}/${this.name}/issues/${issueOrPrNumber}/comments`;

    return this.githubUtils.
      post(pathname, undefined, {body}).
      then(() => undefined);
  }

  public createIssue(title: string, body?: string): Promise<IIssue> {
    const pathname = `repos/${this.owner}/${this.name}/issues`;
    return this.githubUtils.post(pathname, undefined, {title, body});
  }

  public createPullRequest(head: string, base: string, title: string, body?: string): Promise<IPullRequest> {
    const pathname = `repos/${this.owner}/${this.name}/pulls`;
    const payload = {head, base, title, body, maintainer_can_modify: true};
    return this.githubUtils.post(pathname, undefined, payload);
  }

  public getAffectedFiles(baseSha: string, headSha: string): Promise<IFile[]> {
    const pathname = `repos/${this.owner}/${this.name}/compare/${baseSha}...${headSha}`;
    return this.githubUtils.
      get<{files: IFile[]}>(pathname).
      then(({files}) => files);
  }

  public getAvailableLabelNames(): Promise<string[]> {
    const pathname = `repos/${this.owner}/${this.name}/labels`;
    return this.githubUtils.
      getPaginated<{name: string}>(pathname).
      then(labels => labels.map(label => label.name));
  }

  public getAvailableMilestones(): Promise<IMilestone[]> {
    const pathname = `repos/${this.owner}/${this.name}/milestones`;
    return this.githubUtils.getPaginated<IMilestone>(pathname);
  }

  public getBranchNames(): Promise<string[]> {
    const pathname = `repos/${this.owner}/${this.name}/branches`;
    return this.githubUtils.
      getPaginated<{name: string}>(pathname).
      then(branches => branches.map(branch  => branch.name));
  }

  public getBranchUrl(branch: string): string {
    return `${this.baseUrl}/tree/${branch}`;
  }

  public getCompareUrl(baseSha: string, headSha: string): string {
    return `${this.baseUrl}/compare/${baseSha}...${headSha}`;
  }

  public getFileContents(filePath: string, ref?: string): Promise<string> {
    return this.getFileContentsRaw(filePath, ref).then(res => {
      if ((res.content === undefined) || (res.encoding !== 'base64')) {
        throw new Error(stripIndentation(`
          Unexpected response for file contents request (the resource may not be a file):
          ${JSON.stringify(res, null, 2)}
        `));
      }

      return this.decodeBase64(res.content);
    });
  }

  public getFileContentsRaw(filePath: string, ref?: string): Promise<IFileContents> {
    const pathname = `repos/${this.owner}/${this.name}/contents/${filePath}`;
    return this.githubUtils.get(pathname, {ref});
  }

  public getLabels(issueOrPrNumber: number): Promise<string[]> {
    const pathname = `repos/${this.owner}/${this.name}/issues/${issueOrPrNumber}/labels`;
    return this.githubUtils.
      getPaginated<{name: string}>(pathname).
      then(labels => labels.map(label => label.name));
  }

  public getLatestSha(branch: string): Promise<string> {
    const partialUrl = `repos/${this.owner}/${this.name}/commits/${branch}`;
    const extraHeaders = {Accept: 'application/vnd.github.VERSION.sha'};
    return this.githubUtils.requestRaw('get', partialUrl, undefined, extraHeaders);
  }

  public getPullRequest(prNumber: number): Promise<IPullRequest> {
    const pathname = `repos/${this.owner}/${this.name}/pulls/${prNumber}`;
    return this.githubUtils.get(pathname);
  }

  public getPullRequests(searchParams: IPullRequestSearchParams = {}): Promise<IPullRequest[]> {
    const pathname = `repos/${this.owner}/${this.name}/pulls`;
    return this.githubUtils.getPaginated(pathname, searchParams);
  }

  public async removeLabels(issueOrPrNumber: number, labels: string[]): Promise<void> {
    if (labels.length === 0) return;

    const existingLabels = await this.getLabels(issueOrPrNumber);
    const labelsToRemove = labels.filter(label => existingLabels.includes(label));

    const pathnamePrefix = `repos/${this.owner}/${this.name}/issues/${issueOrPrNumber}/labels/`;
    const pathnames = labelsToRemove.map(label => `${pathnamePrefix}${label}`);

    await Promise.all(pathnames.map(pathname => this.githubUtils.delete(pathname)));
  }

  public async setMilestone(
      issueOrPrNumber: number,
      milestoneNumberOrTitle: number | string,
      checkExist = true,
  ): Promise<void> {
    const originalMilestoneNumberOrTitle = milestoneNumberOrTitle;
    const isMilestoneTitle = typeof milestoneNumberOrTitle === 'string';

    if (checkExist || isMilestoneTitle) {
      const availableMilestones = await this.getAvailableMilestones();

      if (isMilestoneTitle) {
        const milestone = availableMilestones.find(ms => ms.title === milestoneNumberOrTitle);
        milestoneNumberOrTitle = milestone ? milestone.number : -1;
      }

      if (!availableMilestones.some(ms => ms.number === milestoneNumberOrTitle)) {
        throw new Error(`No milestone set. Refusing to set non-existent milestone: ${originalMilestoneNumberOrTitle}`);
      }
    }

    const pathname = `repos/${this.owner}/${this.name}/issues/${issueOrPrNumber}`;

    return this.githubUtils.
      patch(pathname, undefined, {milestone: milestoneNumberOrTitle}).
      then(() => undefined);
  }

  private decodeBase64(input: string): string {
    return Buffer.from(input, 'base64').toString('binary');
  }
}
