#!/usr/bin/env node

/* eslint no-console:0 strict:0 */

'use strict'

const aasync = require('asyncawait/async')

const glob = require('glob')
const yargs = require('yargs')

const awaitHelpers = require('./await_helpers.js')
const common = require('./common.js')


if (!yargs.argv._ || yargs.argv._.length !== 4) {
  console.log(`
Usage:  ${common.PROGRAM_NAME} [OPTIONS] <PATH> <VERSION> <APP_URL> <ORG_TOKEN> <SENTRY_PROJECT_NAME>

  PATH is your project root
  VERSION is the target version of that package.
  APP_URL is the URL of the deployed application, that is linked with Sentry.
  ORG_TOKEN is the Sentry API Organization-wide token.
  SENTRY_PROJECT_NAME is the name under which your project is named within Sentry.

  OPTIONS are to be chosen within:

  Sentry Options
  ==============

  --sentry-url : the URL to your Sentry server. Defaults to 'https://app.getsentry.com'
  --sentry-organization : the organization to which the project belongs. Defaults to 'sentry'

  Other Options
  =============

  --pattern : the MAP files search pattern. Defaults to '**/*.map'
  --strip-prefix : the prefix to the MAP files in your NPM package, defaults to 'dist'.
      For instance, if your MAP files look like './built-app/dist/libraries/js/foo.map'
      and the MAP file itself is hosted at '<APP_URL>/libraries/js/foo.map', then
      the appropriate prefix would be 'built-app/dist'.
`)
  process.exit(1)
}

const dirPath = yargs.argv._[0]
const pkgVersion = yargs.argv._[1]
const appUrl = yargs.argv._[2]
const orgToken = new Buffer(`${yargs.argv._[3]}:`).toString('base64')
const sentryProject = yargs.argv._[4]

const mapFilePattern = yargs.argv.pattern || '**/*.map'
const stripPrefix = yargs.argv.stripPrefix || 'dist'

const sentryUrl = yargs.argv.sentryUrl || 'https://app.getsentry.com'
const sentryOrganization = yargs.argv.sentryOrganization || 'sentry'
const releaseUrl = `${sentryUrl}/api/0/projects/${sentryOrganization}/${sentryProject}/releases/`
const releaseFilesUrl = `${releaseUrl}${pkgVersion}/files/`

if (require.main === module) {
  aasync(function () {
    const releasePostResponse = common.createSentryRelease(releaseUrl, pkgVersion, orgToken)
    if (releasePostResponse.response.statusCode !== 200) {
      const errMessage = releasePostResponse.response.body.detail || releasePostResponse.response.body
      console.log('[warning, release creation] Sentry replied with: ' +
                  `${releasePostResponse.response.statusCode}: '${errMessage}'`)
    }

    const sourceMaps = awaitHelpers.awaitFn(glob, `${dirPath}/${mapFilePattern}`)
    for (let mapFile of sourceMaps) {
      try {
        common.uploadMapFile(mapFile, dirPath, stripPrefix, releaseFilesUrl, appUrl, orgToken)
      } catch (err) {
        console.log(`[error] uploading '${mapFile}'.\n  Sentry replied with ` +
                    `${err.statusCode}: '${err.body}'`)
      }
    }
  })()
}
