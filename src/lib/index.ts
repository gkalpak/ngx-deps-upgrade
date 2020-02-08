import {main as aioMain} from './aio';


export async function main() {
  await aioMain();
}

if (require.main === module) {
  main().catch(() => process.exit(1));
}
