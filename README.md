# sentry-sourcemaps

[![Build Status](https://travis-ci.org/theogravity/sentry-sourcemaps-alt.svg?branch=master)](https://travis-ci.org/theogravity/sentry-sourcemaps-alt)
[![codecov.io](https://codecov.io/github/theogravity/sentry-sourcemaps-alt/coverage.svg?branch=master)](https://codecov.io/github/Polyconseil/sentry-sourcemaps-alt?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Sentry 8 comes with a brand new [Releases API][release_api] that finally enables us to
upload JavaScript Source Maps directly to Sentry, and avoid the costly and fragile
remote fetching of the source maps from our application servers.

This tool is intended to do just that: upload your application's source maps to
Sentry along with every release.

It does that seamlessly by downloading your application's package from the NPM
registry (even private ones, of course), looking at the source maps within it,
and gracefully uploading them to your Sentry instance.

## Fork notice

This is forked off the [`sentry-sourcemaps`](https://github.com/Polyconseil/sentry-sourcemaps) project. 

The core differences:
 
* Retooled to work against a local directory instead of pulling a package from NPM to find sourcemaps to upload
* upload map via registry removed (if you want that, use the original project instead)
* exposed upload API for use in your node code.
* adds a url path prefix option
* Uses Auth Bearer token instead of legacy API key (see [here](https://docs.sentry.io/api/auth/)) for auth

```
const uploader = require('sentry-sourcemaps-alt')

// see src/uploader.js for more info
uploader(dirPath, pkgVersion, appUrl, orgToken, sentryProject, mapFilePattern, stripPrefix, sentryUrl, sentryOrganization, mapUrlPrefix)
```

## How it works

Here is a sample CLI usage:

    $ npm install -g sentry-sourcemaps
    $ sentry-sourcemaps-alt --sentry-url https://my.sentry.url . 1.0.0 https://foobar.org TOKEN PROJECT_NAME

As you can see, there are 5 mandatory parameters:

* Your application's root directory;
* The desired release version;
* The URL onto which your application is deployed;
* The Sentry Token needed to push to the Sentry API.
* The name under which your project is named within Sentry.

The application will [create a release][create_release] and upload every MAP file for your app onto
the designed Sentry server.

## Usage

Typical command line:

    sentry-sourcemaps-alt [OPTIONS] <PATH> <VERSION> <APP_URL> <ORG_TOKEN> <PROJECT_NAME>

### Parameters

##### PATH
 is the root of your application project.
##### VERSION
 is the target version of that package.
##### APP_URL
 is the URL of the deployed application, that is linked with Sentry.
##### ORG_TOKEN
 is the Sentry API Organization-wide token.

### Options

##### --sentry-url
The URL to your Sentry server. Defaults to 'https://app.getsentry.com'

##### --sentry-organization
The organization to which the project belongs. Defaults to 'sentry'

##### --pattern
The MAP files search pattern. Defaults to '**/*.map'

##### --strip-prefix

The prefix to the MAP files in your NPM package, defaults to 'dist'.

For instance, if your MAP files look like './built-app/dist/libraries/js/foo.map'
and the MAP file itself is hosted at '<APP_URL>/libraries/js/foo.map', then
the appropriate prefix would be 'built-app/dist'.

##### --map-url-prefix 

prepend a prefix to access your MAP files. 

For instance, if your map is hosted at '<APP_URL>/static/js/foo.map' instead of '<APP_URL>/libraries/js/foo.map'
after using --strip-prefix to remove './built-app/dist/libraries', you use this option to add the 'static' path

## Docker Image

A docker image is available, which enables its use without Node installed.

## Testing

Run the tests with:

  npm test

Run coverage tests with:

  npm run cover

## Contributing

At this stage, any PR is welcome !

Especially, there's room for improvement with our Promisify/Asyncawait approach,
the rejection clauses of many promises are not clearly validated yet.

## Contributors

Victor Perron


## License

MIT

[release_api]: https://docs.getsentry.com/hosted/clients/javascript/sourcemaps/#uploading-source-maps-to-sentry
[create_release]:https://docs.getsentry.com/hosted/api/releases/post-project-releases/
