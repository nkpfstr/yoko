'use strict'

const bs = require('browser-sync').create()
const config = require('./config')
const cname = require('john-cname')
const fs = require('fs-extra')
const log = require('lloogg')
const titleCase = require('title-case')
const metalsmith = require('metalsmith')

// Metalsmith plugins
const layouts = require('metalsmith-layouts')
const markdown = require('metalsmith-markdown')
const permalinks = require('metalsmith-permalinks')
const sass = require('metalsmith-sass')

module.exports = {
  /*
    yoko.new(theme, path)
    ---
    Use <theme> to generate a new Yoko site in <path>
  */
  new (theme, path) {
    // Copy theme files to <path>
    fs.copy(`${__dirname}/../themes/${theme}`, path, err => {
      if (err) {
        return log.error(err)
      }

      // Create a new site config
      config.write({
        site: {
          title: titleCase(path),
          description: 'Describe your site here',
          url: 'http://change.me'
        },
        collections: {
          example: {
            pattern: '*.md',
            sortBy: 'date',
            reverse: true
          }
        },
        permalinks: {
          pattern: ':collection/:title',
          relative: false
        },
        markdown: {
          smartypants: true,
          gfm: true,
          tables: true
        },
        sass: {
          outputStyle: 'expanded'
        },
        github: {
          useCustomDomain: true
        }
      }, `${path}/config.yml`)

      log.success(`New site created in ${process.cwd()}/${path}`)
    })
  },

  /*
    yoko.build(config, source, destination)
    ---
    Use <config> to transform <source> files with Metalsmith and put them in <destination>
  */
  build (siteConfig, source, destination) {
    // Don't proceed without a site config
    if (!siteConfig) {
      return log.error('Yoko configuration file not found')
    }

    let cfg = config.read(siteConfig)

    // Transform <source> files with Metalsmith
    metalsmith(process.cwd())
      // Make Yoko configuration available to Metalsmith
      .metadata(cfg)
      // Files in this directory will be transformed
      .source(source)
      // Transformed files will land in this directory
      .destination(destination)
      // Transform Sass files
      .use(sass(cfg.sass))
      // Transform Markdown files
      .use(markdown(cfg.markdown))
      // Configure permalinks
      .use(permalinks(cfg.permalinks))
      // Apply Handlebars templates
      .use(layouts({
        engine: 'handlebars',
        directory: '_layouts',
        partials: '_partials'
      }))
      // Build transformed files in <destination>
      .build(err => {
        if (err) {
          return log.error(err)
        }

        if (cfg.github.useCustomDomain) {
          cname(cfg.site.url, destination)
        }

        log.success(`Your site was successfully built in ${destination}`)
      })
  },

  /*
    yoko.preview(config)
    ---
    Launch BrowserSync using <config>
  */
  preview (bsConfig) {
    bs.init(bsConfig)
  }
}
