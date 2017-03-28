#!/usr/bin/env node

'use strict'

// Import dependencies
const yoko = require('commander')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const log = require('lloogg')

// yoko -v, --version
yoko.version(require('../package').version)

// yoko new
yoko
  .command('new <path>')
  .alias('n')
  .description('Create a new site')
  .option('-b, --blank', 'Create a new site with a blank theme')
  .action(path => {
    if (path) {
      // Initialize site config
      let siteConfig = {
        site: {
          title: path,
          url: 'http://change.me'
        }
      }
      // Create site directory
      fs.ensureDir(path, err => {
        if (err) {
          return log.error(err)
        }

        // Copy theme files
        fs.copy(`${__dirname}/../themes/default`, path, err => {
          if (err) {
            return log.error(err)
          }

          // Write config file
          fs.outputFile(`${path}/config.yml`, yaml.dump(siteConfig), err => {
            if (err) {
              return log.error(err)
            }
          })

          log.success('Site created successfully')
        })
      })
    }
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
