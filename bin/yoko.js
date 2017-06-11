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
  .command('create <path>', 'Create a new Yoko site')
  .command('run', 'Generate static files & open a live preview')
  .parse(process.argv)
