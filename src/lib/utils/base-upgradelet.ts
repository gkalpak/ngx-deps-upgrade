import 'source-map-support/register';
import * as utils from '.';
import {IParsedArgs, PARSED_ARGS} from './constants';


export abstract class BaseUpgradelet {
  /**
   * Instantiate this `Upgradelet` (a `BaseUpgradelet` subclass) and run `checkAndUpgrade()`.
   *
   * @return A promise that resolves once `checkAndUpgrade()` has finished.
   */
  public static async main(): Promise<void> {
    const upgradelet = new (this as unknown as {new(): BaseUpgradelet})();
    await upgradelet.checkAndUpgrade(PARSED_ARGS);
  }

  protected readonly utils = utils;

  /**
   * Check and (if necessary) upgrade the associated resource.
   *
   * @param args - The parsed arguments.
   * @return A promise that is resolved once the check and any necessary upgrading has been completed.
   */
  public abstract checkAndUpgrade(args: IParsedArgs): Promise<void>;

  /**
   * Check whether the associated resource is up-to-date.
   *
   * @param args - The parsed arguments.
   * @return A promise that is resolved with true is the associated resource is up-to-date or false
   *     otherwise.
   */
  public abstract checkOnly(args: IParsedArgs): Promise<boolean>;
}
