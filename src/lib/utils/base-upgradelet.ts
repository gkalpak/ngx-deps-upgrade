import 'source-map-support/register';
import * as utils from '.';
import {IParsedArgs, PARSED_ARGS} from './constants';


export interface IParsedArgs {
  [key: string]: unknown;
}

export abstract class BaseUpgradelet {
  public static async main(): Promise<void> {
    const upgradelet = new (this as unknown as {new(): BaseUpgradelet})();
    await upgradelet.checkAndUpgrade(PARSED_ARGS);
  }

  protected readonly utils = utils;

  public abstract checkAndUpgrade(args: IParsedArgs): Promise<void>;
  public abstract checkOnly(args: IParsedArgs): Promise<boolean>;
}
