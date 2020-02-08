import {NEWLINE_PLACEHOLDER} from './constants';


export function main() {
  let data = '';

  process.stdin.on('data', d => data += d);
  process.stdin.on('end', () => process.stdout.write(data.split(NEWLINE_PLACEHOLDER).join('\n')));
}

if (require.main === module) {
  main();
} else {
  throw new Error('This script is not supposed to be imported/required by other modules.');
}
