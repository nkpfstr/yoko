#!/usr/bin/env node

'use strict'

// Import dependencies
const cli = require('commander')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const log = require('lloogg')
const hbs = require('handlebars')
const metalsmith = require('metalsmith')
const layouts = require('metalsmith-layouts')
const markdown = require('metalsmith-markdown')
const permalinks = require('metalsmith-permalinks')
const sass = require('metalsmith-sass')
const bs = require('browser-sync').create()

// yoko -v, --version
cli.version(require('../package').version)

// yoko new <path>
cli
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
          fs.outputFile(`${path}/_config.yml`, yaml.dump(siteConfig), err => {
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
cli
  .command('build')
  .alias('b')
  .description('Build static files for your site')
  .action(options => {
    buildSite('./_config.yml', process.cwd())
  })

// yoko preview
cli
  .command('preview')
  .alias('p')
  .description('Preview your site in the default browser')
  .action(options => {
    buildSite('./_config.yml', process.cwd())

    bs.init({
      server: `${process.cwd()}/docs`
    })
  })

cli.parse(process.argv)

// Build site files in <path> using <config>
function buildSite (configFile, path) {
  // Only build if a config file is found
  let config = yaml.load(fs.readFileSync(configFile, 'utf-8'))

  if (!config) {
    log.error('No Yoko configuration found')
  } else {
    // Build files
    metalsmith(path)
      .metadata(config)
      .source('.')
      .ignore(['_layouts', '_config.yml'])
      .destination('docs')
      .use(sass({
        outputDir: 'assets/css/'
      }))
      .use(markdown())
      .use(permalinks({
        pattern: ':collection/:title',
        relative: false
      }))
      .use(layouts({
        engine: 'handlebars',
        directory: '_layouts',
        partials: '_partials'
      }))
      .build(err => {
        if (err) {
          log.error(err)
        } else {
          log.success('Your site was built successfully')
        }
      })
  }
}
