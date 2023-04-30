# Changelog

## [1.0.4](https://github.com/rexerwang/requete/compare/v1.0.3...v1.0.4) (2023-04-30)

### Bug Fixes

- regex for absolute url ([f3d87cc](https://github.com/rexerwang/requete/commit/f3d87cc17b619c0b5eaa6d9cd91c1301f55e1850))
- transform response in adapters ([c59dd4e](https://github.com/rexerwang/requete/commit/c59dd4e0b9fbf637d3ada2a62dc53936c95e515d))

## [1.0.3](https://github.com/rexerwang/requete/compare/v1.0.2...v1.0.3) (2023-04-29)

### Bug Fixes

- **middleware:** format logger output ([83e916a](https://github.com/rexerwang/requete/commit/83e916a903da13636a859aef033e5f747fc334da))

## [1.0.2](https://github.com/rexerwang/requete/compare/v1.0.1...v1.0.2) (2023-04-29)

### Bug Fixes

- stringifyUrl query typings ([76d03e8](https://github.com/rexerwang/requete/commit/76d03e87678768471054b8b68b96ee31cafaffe3))
- unified error type to RequestError & logger output ([8403ec7](https://github.com/rexerwang/requete/commit/8403ec7ee423881927c21cff80f0a18644579b3b))

## [1.0.1](https://github.com/rexerwang/requete/compare/v1.0.0...v1.0.1) (2023-04-28)

### Bug Fixes

- exports field subdir stuct & remove `dist` nested dir ([08b9505](https://github.com/rexerwang/requete/commit/08b9505ec49f0dacf4fcdb21ebe1aa04d6a3db70))

# [1.0.0](https://github.com/rexerwang/requete/compare/v0.1.1...v1.0.0) (2023-04-28)

### Bug Fixes

- class XhrAdepter abort logic & progress event ([b371a26](https://github.com/rexerwang/requete/commit/b371a26faac7e69a955e233de6a7345afd5a8ce4))
- transform body when nil ([9d87c66](https://github.com/rexerwang/requete/commit/9d87c66bd4ab99f71b0d45e772c3ea1297eb1840))
- **xhr:** formData type response ([86190cc](https://github.com/rexerwang/requete/commit/86190cc3f6abe0642b9c5a8b04e42f6231b97a63))

- feat!: optimize exports & types ([dffb470](https://github.com/rexerwang/requete/commit/dffb4705bd6316a584875c4a28aa70709c9c4dd1))

### Features

- **adapter:** add `createAdapter` for choose the supported ([231b396](https://github.com/rexerwang/requete/commit/231b396db1fe09dd13efbefb0057d06281c4424a))

### BREAKING CHANGES

- optimize exports

* exports `requete/adapter`
* exports `requete/middleware`
* add logger middleware
* refactor typings

## [0.1.3](https://github.com/rexerwang/requete/compare/v0.1.1...v0.1.3) (2023-04-25)

### Bug Fixes

- class XhrAdepter abort logic & progress event ([b371a26](https://github.com/rexerwang/requete/commit/b371a26faac7e69a955e233de6a7345afd5a8ce4))
- transform body when nil ([9d87c66](https://github.com/rexerwang/requete/commit/9d87c66bd4ab99f71b0d45e772c3ea1297eb1840))
- **xhr:** formData type response ([86190cc](https://github.com/rexerwang/requete/commit/86190cc3f6abe0642b9c5a8b04e42f6231b97a63))

## [0.1.2](https://github.com/rexerwang/requete/compare/v0.1.1...v0.1.2) (2023-04-21)

### Bug Fixes

- class XhrAdepter abort logic & progress event ([b371a26](https://github.com/rexerwang/requete/commit/b371a26faac7e69a955e233de6a7345afd5a8ce4))
- transform body when nil ([9d87c66](https://github.com/rexerwang/requete/commit/9d87c66bd4ab99f71b0d45e772c3ea1297eb1840))

## [0.1.1](https://github.com/rexerwang/requete/compare/0.1.0...v0.1.1) (2023-04-20)

### Bug Fixes

- add `license` in package.json ([402ac79](https://github.com/rexerwang/requete/commit/402ac794c578297a93a28f65f238791d78d5eee8))
- getUri func ([eaab756](https://github.com/rexerwang/requete/commit/eaab756b12dedee74d33a65a342d4ba3949977d9))

# [0.1.0](https://github.com/rexerwang/requete/compare/cc7701691e39bfcf986846645dc195e11aefb134...0.1.0) (2023-04-19)

### Bug Fixes

- remove postinstall script ([be6af04](https://github.com/rexerwang/requete/commit/be6af04a866bb0c607e8e5a78e63157d13d81da7))

- chore!: rename requete ([b9bf0c7](https://github.com/rexerwang/requete/commit/b9bf0c72b7d603c660f40d810a16a1fd4b039dc0))

### Features

- add polyfill & build ([4bfab35](https://github.com/rexerwang/requete/commit/4bfab3598f3ed96fbd397be072199ca0f4730f0c))
- **build:** exports default when umd & cjs ([9493b20](https://github.com/rexerwang/requete/commit/9493b20f4702b05216e6167fdb06d66d3fdec556))
- class HttpRequest ([cc77016](https://github.com/rexerwang/requete/commit/cc7701691e39bfcf986846645dc195e11aefb134))
- optimize build & publish ([61dbbf1](https://github.com/rexerwang/requete/commit/61dbbf1963f559c0ca6bc8383ff278aefbe8b352))

### BREAKING CHANGES

- rename repo to `requete` (means request in French)

# 0.1.0 (2023-04-19)

### Bug Fixes

- remove postinstall script ([be6af04](https://github.com/rexerwang/requete/commit/be6af04a866bb0c607e8e5a78e63157d13d81da7))

- chore!: rename requete ([b9bf0c7](https://github.com/rexerwang/requete/commit/b9bf0c72b7d603c660f40d810a16a1fd4b039dc0))

### Features

- add polyfill & build ([4bfab35](https://github.com/rexerwang/requete/commit/4bfab3598f3ed96fbd397be072199ca0f4730f0c))
- **build:** exports default when umd & cjs ([9493b20](https://github.com/rexerwang/requete/commit/9493b20f4702b05216e6167fdb06d66d3fdec556))
- class HttpRequest ([cc77016](https://github.com/rexerwang/requete/commit/cc7701691e39bfcf986846645dc195e11aefb134))
- optimize build & publish ([61dbbf1](https://github.com/rexerwang/requete/commit/61dbbf1963f559c0ca6bc8383ff278aefbe8b352))

### BREAKING CHANGES

- rename repo to `requete` (means request in French)
