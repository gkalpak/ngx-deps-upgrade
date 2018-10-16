import {Upgradelet as CLiSrcUpgradelet} from './upgrade-cli-src';

export async function main() {
  await CLiSrcUpgradelet.main();
}

if (require.main === module) {
  main();
}
