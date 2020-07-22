import {IIntegerString} from './constants';


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

export const isIntegerString = (input: string): input is IIntegerString => /^\d+$/.test(input);

export const sleep = (duration: number): Promise<void> => new Promise(resolve => setTimeout(resolve, duration));

export const stripIndentation = (input: string): string => {
  const lines = input.replace(/^ *\n/, '').replace(/\n *$/, '').split('\n');
  const minIndentation = Math.min(...lines.
    filter(l => !/^ *$/.test(l)).
    map(l => /^ */.exec(l)![0].length));
  const re = new RegExp(`^ {0,${minIndentation}}`);

  return lines.map(l => l.replace(re, '')).join('\n');
};

export const wrapLine = (line: string, maxLength: number) => {
  // Split into words, but preserve Markdown links (`[...](...)`).
  const words = line.split(/(?<=^[^[]*(?:\[[^\]]*][^\[]*)*) /).reverse();
  const wrappedLine = [words.pop()];

  while (words.length) {
    const lastLine = wrappedLine[wrappedLine.length - 1]!;
    const nextWord = words.pop()!;

    if (lastLine.length + nextWord.length > maxLength) {
      wrappedLine.push(nextWord);
    } else {
      wrappedLine[wrappedLine.length - 1] = `${lastLine} ${nextWord}`;
    }
  }

  return wrappedLine;
};

export const wrapText = (input: string, maxLineLength: number) => {
  const linesWithSeparators = input.split(/(\r?\n)/);
  let wrappedText = '';

  for (let i = 0, ii = linesWithSeparators.length; i < ii; i += 2) {
    const line = linesWithSeparators[i];
    const lineBreak = linesWithSeparators[i + 1];
    const wrappedLine = wrapLine(line, maxLineLength);

    wrappedText += wrappedLine.join(lineBreak || '\n') + (lineBreak || '');
  }

  return wrappedText;
};
