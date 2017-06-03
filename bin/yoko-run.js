#!/usr/bin/env node

'use strict'

// Dependencies
const yoko = require('commander')
const Figg = require('figg')
const fs = require('fs-extra')
const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const metalsmith = require('metalsmith')
const markdown = require('metalsmith-markdown')
const drafts = require('metalsmith-drafts')
const layouts = require('metalsmith-layouts')
const collections = require('metalsmith-collections')
const permalinks = require('metalsmith-permalinks')
const rss = require('metalsmith-feed')
const sitemap = require('metalsmith-mapsite')
const bs = require('browser-sync').create()

// Initialize settings
const settings = new Figg({
  name: 'yoko'
})

// Command options & parsing
yoko
  .parse(process.argv)

// Easier way to reference the current working directory
const cwd = process.cwd()

// Get options for use in build tasks
function getOptions (options) {
  if (settings.has(options)) {
    return settings.get(options)
  } else {
    return {}
  }
}

// Handlebars/Markdown -> HTML
function buildContent () {
  metalsmith(cwd)
    // Add site metadata
    .metadata(settings.get('site'))
    // Target files in this directory
    .source('content')
    // Output static files in this directory
    .destination('docs')
    // Render Markdown
    .use(markdown(getOptions('markdown')))
    // Configure permalinks
    .use(permalinks(getOptions('permalinks')))
    // Apple Handlebars templates
    .use(layouts({
      engine: 'handlebars',
      directory: 'templates',
      partials: 'templates/partials'
    }))
    // Build static files
    .build(err => {
      if (err) {
        return console.error(err)
      }
    })
}

// Sass -> CSS
function buildSass () {
  return gulp.src(`${cwd}/assets/sass/**/*.scss`)
    .pipe(sass(getOptions('sass')).on('error', sass.logError))
    .pipe(autoprefixer(getOptions('autoprefixer')))
    .pipe(gulp.dest(`${cwd}/docs/assets/css`))
}

/*
  NOTE: The build tasks are wrapped inside the function below to ensure
  they only run if a Yoko file exists in the current working directory.
*/

// Search for a Yoko file in the current working directory
fs.pathExists(settings.file, (err, exists) => {
  // Do not proceed with an error
  if (err) {
    return console.error(err)
  }

  // Do not proceed without a Yoko file
  if (!exists) {
    console.error('Yoko site not found')
    console.error('The build command must be run from the same directory as your Yoko site')
    return
  }

  // We found a Yoko file! Load the contents on our settings object
  settings.load()

  /* ----- CONTENT ----- */
  fs.pathExists('content', (err, exists) => {
    // Do not proceed with an error
    if (err) {
      return console.error(err)
    }

    // Do not proceed without a content directory
    if (!exists) {
      return console.log('Skipped content build')
    }

    // Build Handlebars templates
    buildContent()
  })

  /* ----- SASS ----- */

  // Search for a Sass directory
  fs.pathExists('assets/sass', (err, exists) => {
    // Do not proceed with an error
    if (err) {
      return console.error(err)
    }

    // Do not proceed without a Sass directory
    if (!exists) {
      return console.log('Skipped Sass build')
    }

    // Build Sass files
    buildSass()
  })

  /* ----- JS ----- */
  // TODO

  /* ----- IMAGES ----- */
  // TODO

  /* ----- PREVIEW ----- */

  // Launch the preview server
  bs.init({
    server: 'docs'
  })

  // Rebuild static files when source changes are detected
  bs.watch(['./templates/**/*.hbs', './content/**/*.md']).on('change', buildContent)
  bs.watch('./assets/sass/**/*.scss').on('change', buildSass)

  // Refresh the preview server when static files are rebuilt
  bs.watch('docs/**/*').on('change', bs.reload)
})
