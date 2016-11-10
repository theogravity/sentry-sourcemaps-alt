/* eslint strict:0 */

'use strict'

const aasync = require('asyncawait/async')
const aawait = require('asyncawait/await')

const chai = require('chai')
const nock = require('nock')

const common = require('./common.js')

describe('common', () => {
  it('should export PROGRAM_NAME', () => {
    chai.expect(common.PROGRAM_NAME).to.equal('sentry-sourcemaps')
  })

  it('should have an uploadMapFile function that uploads to Sentry', aasync(() => {
    const filePath = '/foobar/package/stripMe/some.file.map'
    const appUrl = 'https://fantastic.app/js'
    const pushUrl = 'http://sentry/xxx/release/'

    const fsmock = require('mock-fs')
    fsmock({
      '/foobar/package/stripMe': {
        'some.file.map': 'CONTENT',
      },
    })

    let savedBody = null
    const mockedPost = nock('http://sentry').post('/xxx/release/', function (body) {
      savedBody = body
      return true
    }).reply(200, 'OK')
    aawait(common.uploadMapFile(filePath, '/foobar', 'stripMe', pushUrl, appUrl, 'FAKETOKEN'))
    fsmock.restore()

    chai.expect(mockedPost.isDone()).to.equal(true)
    chai.expect(savedBody).to.contain(`${appUrl}/some.file.map`)
  }))
})
