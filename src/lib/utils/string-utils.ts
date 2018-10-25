export const stripIndentation = (input: string): string => {
  const lines = input.replace(/^ *\n/, '').replace(/\n *$/, '').split('\n');
  const minIndentation = Math.min(...lines.
    filter(l => !/^ *$/.test(l)).
    map(l => /^ */.exec(l)![0].length));
  const re = new RegExp(`^ {0,${minIndentation}}`);

  return lines.map(l => l.replace(re, '')).join('\n');
};
