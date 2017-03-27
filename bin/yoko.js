#!/usr/bin/env node

'use strict'

// Import dependencies
const cli = require('commander')

// yoko -v, --version
cli.version(require('../package').version)

// yoko new
cli
  .command('new')
  .alias('n')
  .description('Create a new site')
  .action()

// yoko build
cli
  .command('build')
  .alias('b')
  .description('Build static files for your site')
  .action()

// yoko preview
cli
  .command('preview')
  .alias('p')
  .description('Preview your site in the default browser')
  .action()

cli.parse(process.argv)
