/* eslint no-console:0 strict:0 */
'use strict'

const aasync = require('asyncawait/async')
const awaitHelpers = require('./await_helpers.js')

const glob = require('glob')
const common = require('./common.js')

module.exports = function uploadMapFiles (dirPath, pkgVersion, appUrl, orgToken, sentryProject, mapFilePattern, stripPrefix, sentryUrl, sentryOrganization, mapUrlPrefix) {

  stripPrefix = stripPrefix || 'dist'
  sentryUrl = sentryUrl || 'https://app.getsentry.com'
  sentryOrganization = sentryOrganization || 'sentry'
  mapFilePattern = mapFilePattern || '**/*.map'

  const releaseUrl = `${sentryUrl}/api/0/projects/${sentryOrganization}/${sentryProject}/releases/`
  const releaseFilesUrl = `${releaseUrl}${pkgVersion}/files/`

  aasync(function () {
    console.log('[sentry-sourcemap] creating release')

    const releasePostResponse = common.createSentryRelease(releaseUrl, pkgVersion, orgToken)
    if (releasePostResponse.response.statusCode !== 200) {
      const statusMsg = releasePostResponse.response.statusMessage
      const errMessage = releasePostResponse.response.body.detail || releasePostResponse.response.body
      console.log('[sentry-sourcemap] [warning, release creation] Sentry replied with: ' +
        `${releasePostResponse.response.statusCode}: ${statusMsg}`, errMessage)
    }

    const mapPath = `${dirPath}/${mapFilePattern}`

    console.log('[sentry-sourcemap] looking for sourcemaps at', mapPath)
    const sourceMaps = awaitHelpers.awaitFn(glob, mapPath)

    for (let mapFile of sourceMaps) {
      try {
        console.log(`[sentry-sourcemap] uploading '${mapFile}'`)
        common.uploadMapFile(mapFile, stripPrefix, releaseFilesUrl, appUrl, orgToken, mapUrlPrefix)
      } catch (err) {
        console.log(`[sentry-sourcemap] [error] uploading '${mapFile}'.\n  Sentry replied with ` +
          `${err.statusCode}: '${err.body}'`)
      }
    }

    process.exit(0)
  })()
}
