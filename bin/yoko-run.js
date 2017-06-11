#!/usr/bin/env node

'use strict'

// Dependencies
const yoko = require('commander')
const Figg = require('figg')
const fs = require('fs-extra')
const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const butternut = require('gulp-butternut')
const concat = require('gulp-concat')
const metalsmith = require('metalsmith')
const markdown = require('metalsmith-markdown')
const drafts = require('metalsmith-drafts')
const layouts = require('metalsmith-layouts')
const collections = require('metalsmith-collections')
const permalinks = require('metalsmith-permalinks')
const rss = require('metalsmith-feed')
const sitemap = require('metalsmith-mapsite')
const preview = require('browser-sync').create()

// Initialize settings
const settings = new Figg({
  name: 'yoko'
})

// Command options & parsing
yoko
  .option('-n, --nopreview', 'Compile your site without launchg a live preview')
  .parse(process.argv)

// Easier way to reference the current working directory
const cwd = process.cwd()

// Get options for use in build tasks
function getOptions(options) {
  if (settings.has(options)) {
    return settings.get(options)
  } else {
    return {}
  }
}

// Handlebars/Markdown -> HTML
function compileContent() {
  metalsmith(cwd)
    // Add site info to metadata
    .metadata(settings.get('site'))
    // Target files in this directory
    .source('content')
    // Output static files in this directory
    .destination('docs')
    // Do not clean the destination directory on every build
    .clean(false)
    // Group related content
    .use(collections(getOptions('collections')))
    // Render Markdown
    .use(markdown(getOptions('markdown')))
    // Configure permalinks
    .use(permalinks(getOptions('permalinks')))
    // Apple Handlebars templates
    .use(
      layouts({
        engine: 'handlebars',
        default: 'default.hbs',
        directory: 'templates',
        partials: 'templates/partials'
      })
    )
    // Build static files
    .build(err => {
      if (err) {
        return console.error(err)
      }

      if (!yoko.nopreview) {
        preview.reload()
      }
    })
}

// Sass -> CSS
function compileSass() {
  return gulp
    .src(`${cwd}/assets/sass/**/*.scss`)
    .pipe(sass(getOptions('sass')).on('error', sass.logError))
    .pipe(autoprefixer(getOptions('autoprefixer')))
    .pipe(gulp.dest(`${cwd}/docs/assets/css`))
    .pipe(preview.stream())
}

function compileJS() {
  return gulp
    .src(`${cwd}/assets/js/**/*.js`)
    .pipe(butternut())
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest(`${cwd}/docs/assets/js`))
}

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
    if (err) {
      return console.error(err)
    }

    // Don't try to compile unless there's a content directory
    if (!exists) {
      return console.log('Content build skipped')
    } else {
      compileContent()
      console.log('Content compiled successfully')
    }
  })

  /* ----- SASS ----- */

  // Search for a Sass directory
  fs.pathExists('assets/sass', (err, exists) => {
    if (err) {
      return console.error(err)
    }

    // Don't try to compile unless there's a sass directory
    if (!exists) {
      return console.log('Sass build skipped')
    } else {
      compileSass()
      console.log('Sass compiled successfully')
    }
  })

  /* ----- JS ----- */
  fs.pathExists('assets/js', (err, exists) => {
    if (err) {
      return console.error(err)
    }

    // Don't try to compile unless there's a js directory
    if (!exists) {
      return console.log('JS build skipped')
    } else {
      compileJS()
      console.log('JS compiled successfully')
    }
  })

  /* ----- IMAGES ----- */
  // TODO

  /* ----- PREVIEW ----- */
  if (!yoko.nopreview) {
    // Rebuild static files when source changes are detected
    preview.watch(['./templates/**/*.hbs', './content/**/*.md']).on('change', compileContent)
    preview.watch('./assets/sass/**/*.scss').on('change', compileSass)
    preview.watch('./assets/js/**/*.js').on('change', compileJS)

    // Refresh the preview server when static files are rebuilt
    preview.watch('*.html').on('change', preview.reload)

    // Launch the preview server
    preview.init({
      server: 'docs'
    })
  }
})
