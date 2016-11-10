/* eslint no-console:0 strict:0 */
'use strict'

const aasync = require('asyncawait/async')
const awaitHelpers = require('./await_helpers.js')

const glob = require('glob')
const common = require('./common.js')

module.exports = function uploadMapFiles (dirPath, pkgVersion, appUrl, orgToken, sentryProject, mapFilePattern, stripPrefix, sentryUrl, sentryOrganization, mapUrlPrefix) {

  orgToken = new Buffer(`${orgToken}:`).toString('base64')
  stripPrefix = stripPrefix || 'dist'
  sentryUrl = sentryUrl || 'https://app.getsentry.com'
  sentryOrganization = sentryOrganization || 'sentry'
  mapFilePattern = mapFilePattern || '**/*.map'

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
          common.uploadMapFile(mapFile, dirPath, stripPrefix, releaseFilesUrl, appUrl, orgToken, mapUrlPrefix)
        } catch (err) {
          console.log(`[error] uploading '${mapFile}'.\n  Sentry replied with ` +
            `${err.statusCode}: '${err.body}'`)
        }
      }
    })()
  }
}
