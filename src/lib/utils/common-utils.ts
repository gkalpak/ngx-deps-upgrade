export const capitalize = (input: string): string => {
  return input[0].toUpperCase() + input.slice(1);
};

export const group = <T extends {[key: string]: unknown}, U extends keyof T>(items: T[], prop: U): Map<T[U], T[]> => {
  const groupped = new Map<T[U], T[]>();

  items.forEach(item => {
    const groupName = item[prop];

    if (!groupped.has(groupName)) {
      groupped.set(groupName, []);
    }

    groupped.get(groupName)!.push(item);
  });

  return groupped;
};

export const sleep = (duration: number): Promise<void> => new Promise(resolve => setTimeout(resolve, duration));

export const stripIndentation = (input: string): string => {
  const lines = input.replace(/^ *\n/, '').replace(/\n *$/, '').split('\n');
  const minIndentation = Math.min(...lines.
    filter(l => !/^ *$/.test(l)).
    map(l => /^ */.exec(l)![0].length));
  const re = new RegExp(`^ {0,${minIndentation}}`);

  return lines.map(l => l.replace(re, '')).join('\n');
};
