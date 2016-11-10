#!/usr/bin/env node

/* eslint no-console:0 strict:0 */

'use strict'

const yargs = require('yargs')
const uploader = require('./uploader')

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
  --strip-prefix : the prefix to the MAP files, defaults to 'dist'.
      For instance, if your MAP files look like './built-app/dist/libraries/js/foo.map'
      and the MAP file itself is hosted at '<APP_URL>/libraries/js/foo.map', then
      the appropriate prefix would be 'built-app/dist'.
  --map-url-prefix : prepend a prefix to access your MAP files. 
      For instance, if your map is hosted at '<APP_URL>/static/js/foo.map' instead of '<APP_URL>/libraries/js/foo.map'
      after using --strip-prefix to remove './built-app/dist/libraries', you use this option to add the 'static' path
`)
  process.exit(1)
}

const dirPath = yargs.argv._[0]
const pkgVersion = yargs.argv._[1]
const appUrl = yargs.argv._[2]
const orgToken = yargs.argv._[3]
const sentryProject = yargs.argv._[4]

const sentryUrl = yargs.argv.sentryUrl
const sentryOrganization = yargs.argv.sentryOrganization
const mapFilePattern = yargs.argv.pattern
const stripPrefix = yargs.argv.stripPrefix
const mapUrlPrefix = yargs.argv.mapUrlPrefix

uploader(dirPath, pkgVersion, appUrl, orgToken, sentryProject, mapFilePattern, stripPrefix, sentryUrl, sentryOrganization, mapUrlPrefix)
