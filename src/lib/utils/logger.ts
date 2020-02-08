import chalk from 'chalk';
import stripAnsi from 'strip-ansi';


export const enum LogLevel {
  debug = 1,
  info,
  log,
  warn,
  error,
}

export class Logger {
  private readonly logs: string[] = [];

  constructor(private readonly logLevel = LogLevel.info) {
  }

  public debug(msg: string): void {
    this.doLog(LogLevel.debug, console.debug, chalk.gray(`[debug] ${msg}`));
  }

  public error(msg: string): void {
    this.doLog(LogLevel.error, console.error, chalk.red(msg));
  }

  public getLogs() {
    return this.logs.slice();
  }

  public info(msg: string): void {
    this.doLog(LogLevel.info, console.info, chalk.cyan(`[info] ${msg}`));
  }

  public log(msg: string): void {
    this.doLog(LogLevel.log, console.log, msg);
  }

  public warn(msg: string): void {
    this.doLog(LogLevel.warn, console.warn, chalk.yellow(msg));
  }

  private doLog(logLevel: LogLevel, printFn: (msg: string) => void, msg: string): void {
    this.logs.push(`[LogLevel: ${logLevel}] ${stripAnsi(msg)}`);

    if (this.logLevel <= logLevel) {
      printFn(msg);
    }
  }
}
