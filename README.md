# volto-banner

[![Releases](https://img.shields.io/github/v/release/eea/volto-banner)](https://github.com/eea/volto-banner/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-banner%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-banner/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-banner%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-banner/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner&branch=develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner&branch=develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner&branch=develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner&branch=develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner&branch=develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner&branch=develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner&branch=develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner&branch=develop)

[Volto](https://github.com/plone/volto) add-on

## Features

A customizable banner to highlight to the user that the website is in demo, dev
or staging state.

It is configurable through `/controlpanel/banner`.

![image](https://raw.githubusercontent.com/eea/volto-banner/master/docs/volto-banner.png)

## Upgrades

### Upgrade to 2.x.x

- Version `2.x.x` requires [eea.banner](https://github.com/eea/eea.banner) Plone add-on to be installed on backend.

## Getting started

### Try volto-banner with Docker

      git clone https://github.com/eea/volto-banner.git
      cd volto-banner
      make
      make start

Go to http://localhost:3000

`make start` now defaults to Volto 18. To run the same setup against Volto 17, use:

      VOLTO_VERSION=17 make
      VOLTO_VERSION=17 make start

To reproduce the Volto Light Theme integration, set `VLT_ENABLED` to any non-empty value, for example:

      VLT_ENABLED=1 make
      VLT_ENABLED=1 make start

### Add volto-banner to your Volto project

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

   ```Bash
   docker compose up backend
   ```

1. Start Volto frontend

* If you already have a volto project, just update `package.json`:

   ```JSON
   "dependencies": {
       "@eeacms/volto-banner": "*"
   }
   ```

   and `volto.config.js`:

   ```JavaScript
   const addons = ['@eeacms/volto-banner'];
   ```

* If not, create one with Cookieplone, as recommended by the official Plone documentation for Volto 18+:

   ```
   uvx cookieplone project
   cd project-title
   ```

1. Install or update dependencies, then start the project:

   ```
   make install
   ```

   For a Cookieplone project, start the backend and frontend in separate terminals:

   ```
   make backend-start
   make frontend-start
   ```

   For a legacy Volto 17 project, install the package with `yarn` and restart the frontend as usual.

1. Go to http://localhost:3000

1. Happy editing!

## Release

See [RELEASE.md](https://github.com/eea/volto-banner/blob/master/RELEASE.md).

## How to contribute

See [DEVELOP.md](https://github.com/eea/volto-banner/blob/master/DEVELOP.md).

## Copyright and license

The Initial Owner of the Original Code is European Environment Agency (EEA).
All Rights Reserved.

See [LICENSE.md](https://github.com/eea/volto-banner/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
