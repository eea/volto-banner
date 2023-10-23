# volto-banner

[![Releases](https://img.shields.io/github/v/release/eea/volto-banner)](https://github.com/eea/volto-banner/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-banner%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-banner/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner-master&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner-master)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner-master&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner-master)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner-master&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner-master)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner-master&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner-master)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-banner%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-banner/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner-develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner-develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner-develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner-develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner-develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner-develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner-develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner-develop)

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

### Add volto-banner to your Volto project

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

   ```Bash
   docker compose up backend
   ```

1. Start Volto frontend

* If you already have a volto project, just update `package.json`:

   ```JSON
   "addons": [
       "@eeacms/volto-banner"
   ],

   "dependencies": {
       "@eeacms/volto-banner": "*"
   }
   ```

* If not, create one:

   ```
   npm install -g yo @plone/generator-volto
   yo @plone/volto my-volto-project --canary --addon @eeacms/volto-banner
   cd my-volto-project
   ```

1. Install new add-ons and restart Volto:

   ```
   yarn
   yarn start
   ```

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
