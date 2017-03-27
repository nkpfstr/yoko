#!/usr/bin/env node

'use strict'

// Import dependencies
const yoko = require('commander')

// yoko -v, --version
yoko.version(require('../package').version)

// yoko new
yoko
  .command('new <path>')
  .alias('n')
  .description('Create a new site')
  .action(path => {
    // Get template files
    // Generate a config file
  })

// yoko build
yoko
  .command('build')
  .alias('b')
  .description('Build static files for your site')
  .action()

// yoko preview
yoko
  .command('preview')
  .alias('p')
  .description('Preview your site in the default browser')
  .action()

yoko.parse(process.argv)
