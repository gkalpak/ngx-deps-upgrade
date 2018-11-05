import {ShellString as ShellStringType} from 'shelljs';

declare module 'shelljs' {
  const ShellString: {
    (str: string): ShellStringType;
    new (str: string): ShellStringType;
  };
}
