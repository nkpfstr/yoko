#!/usr/bin/env node

'use strict'

const yoko = require('commander')

/*
  The logic for each command is broken out into separate files.

  yoko create = bin/yoko-create.js
  yoko build = bin/yoko-build.js
  yoko preview = bin/yoko-preview.js
*/
yoko
  .version(require('../package').version)
  .command('create <path> [theme]', 'Create a new Yoko site')
  .command('build', 'Generate static files for your site')
  .command('preview', 'Open a live preview of your site in the default browser')
  .parse(process.argv)
