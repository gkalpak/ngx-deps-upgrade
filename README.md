# ngx-deps-upgrade [![Build Status][build-status-image]][build-status]


## Description

A private collection of utilities and scripts to help in keeping specific dependencies up-to-date.


## Usage

**You** should generally not use it.<br />
**I** may use it for something, but it remains to be determined :grin:


## Testing

The following test-types/modes are available:

- **Code-linting:** `npm run lint`<br />
  _Lint TypeScript files using TSLint._

- **Unit tests:** `npm run test-unit`<br />
  _Run all the unit tests once. These tests are quick and suitable to be run on every change._

- **E2E tests:** `npm run test-e2e`<br />
  _Run all the end-to-end tests once. These test may hit actual API endpoints or perform expensive
  I/O operations and are considerably slower than unit tests._

- **All tests:** `npm test` / `npm run test`<br />
  _Run all of the above tests (code-linting, unit tests, e2e tests). This command is automatically
  run before every release (via `npm run release`)._

- **"Dev" mode:** `npm run dev`<br />
  _Watch all files and rerun the unit tests whenever something changes. For performance reasons,
  code-linting and e2e tests are omitted._


## Known issues

- When using a GitHub Personal Access Token (PAT), the `public_repo` scope should be (and most of
  the time is) enough, but occasionally the following error will arise even when not modifying any
  files inside `.github/workflows/` ([example][pat-error-example]):
  ```
  Refusing to allow a Personal Access Token to create or update workflow
  `.github/workflows/<...>.yml` without `workflow` scope.
  ```

  In such cases, a work-around is to temporarily give the PAT the `workflow` scope (in
  [GitHub settings][github-settings-pats]) and manually re-run the
  [Check for updates][check-for-updates-workflow] workflow.


## TODO

Things I want to (but won't necessarily) do:

- Add unit and e2e tests.
- Add more upgradelets.



[build-status]: https://github.com/gkalpak/ngx-deps-upgrade/actions/workflows/ci.yml
[build-status-image]: https://github.com/gkalpak/ngx-deps-upgrade/actions/workflows/ci.yml/badge.svg?branch=master&event=push
[check-for-updates-workflow]: https://github.com/gkalpak/ngx-deps-upgrade/actions/workflows/check-for-updates.yml
[github-settings-pats]: https://github.com/settings/tokens
[pat-error-example]: https://github.com/gkalpak/ngx-deps-upgrade/issues/62
