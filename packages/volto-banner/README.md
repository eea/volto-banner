# @eeacms/volto-banner

[![Releases](https://img.shields.io/github/v/release/eea/volto-banner)](https://github.com/eea/volto-banner/releases)
[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-banner%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-banner/job/master/display/redirect)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-banner&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-banner)

[Volto](https://github.com/plone/volto) add-on

## Features

A customizable banner to highlight to the user that the website is in demo, dev
or staging state.

It is configurable through `/controlpanel/banner`.

![image](https://raw.githubusercontent.com/eea/volto-banner/master/docs/volto-banner.png)

## Upgrades

### Upgrade to 2.x.x

- Version `2.x.x` requires [eea.banner](https://github.com/eea/eea.banner) Plone add-on to be installed on backend.

## Requirements

### Backend

- [Plone](https://plone.org/download)
- [plone.restapi](https://pypi.org/project/plone.restapi/)

### Frontend

- Node.js: `>=22.0.0`

## Installation

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

1. Go to http://localhost:3000

1. Happy editing!

## License

See [LICENSE.md](LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
