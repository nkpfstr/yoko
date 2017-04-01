#!/usr/bin/env node

'use strict'

// Import dependencies
const cli = require('commander')
const log = require('lloogg')
const yoko = require('./lib/yoko')

// yoko -v, --version
cli.version(require('../package').version)

// yoko new <path>
cli
  .command('new <path>')
  .alias('n')
  .description('Create a new site')
  .option('-b, --blank', 'Create a new site with a blank theme')
  .action((path, options) => {
    if (options.blank) {
      // Create a bare-bones project using the blank theme
      yoko.new('blank', path)
    } else {
      // Create a more opinionated project using the default theme
      yoko.new('default', path)
    }
  })

// yoko build
cli
  .command('build')
  .alias('b')
  .description('Build static files for your site')
  .action(options => {
    yoko.build('./config.yml', '.', 'docs')
  })

// yoko preview
cli
  .command('preview')
  .alias('p')
  .description('Preview your site in the default browser')
  .action(options => {
    yoko.preview({
      server: `./docs`,
      files: './docs/**/*'
    })
  })

cli.parse(process.argv)
