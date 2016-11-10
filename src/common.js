/* eslint strict:0 no-console:0 */

'use strict'

const fs = require('fs')
const path = require('path')

const awaitHelpers = require('./await_helpers.js')
const request = require('request')

const PROGRAM_NAME = 'sentry-sourcemaps'

function strippedPathAfter (str, prefix) {
  const lastPart = str.split(prefix)[1]
  return lastPart.replace(/^\/|\/$/g, '')
}

function uploadMapFile (mapFile, stripPrefix, releaseFilesUrl, appUrl, orgToken, mapUrlPrefix) {
  let mapFileStrippedPath = strippedPathAfter(mapFile, stripPrefix)

  if (mapUrlPrefix) {
    mapFileStrippedPath = path.join(mapUrlPrefix, mapFileStrippedPath)
  }

  const response = awaitHelpers.awaitFn(request, {
    url: releaseFilesUrl,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${orgToken}`,
    },
    formData: {
      file: fs.createReadStream(mapFile),
      name: appUrl ? `${appUrl}/${mapFileStrippedPath}` : mapFileStrippedPath,
    },
  })
  if ([200, 201, 409].indexOf(response.statusCode) === -1) {
    throw response
  }
}

function createSentryRelease (releaseUrl, pkgVersion, orgToken) {
  return awaitHelpers.awaitRequest({
    url: releaseUrl,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${orgToken}`,
    },
    json: true,
    body: {
      version: pkgVersion,
    },
  })
}

module.exports = {
  PROGRAM_NAME: PROGRAM_NAME,
  createSentryRelease: createSentryRelease,
  uploadMapFile: uploadMapFile,
}
