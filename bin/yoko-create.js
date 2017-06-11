#!/usr/bin/env node

'use strict'

// Dependencies
const yoko = require('commander')
const downloadTheme = require('download-git-repo')
const Figg = require('figg')
const fs = require('fs-extra')
const titleCase = require('title-case')

// Command options & parsing
yoko
  .option('-b, --blank', 'Use a theme that only includes the minimum required files')
  .option('-t, --theme [url]', 'Install an existing theme from Github, Gitlab or Bitbucket')
  .parse(process.argv)

// <path> argument
const yokoPath = yoko.args[0]

// Initialize settings
const settings = new Figg({
  name: 'yoko',
  path: yokoPath
})

// Default theme settings
const defaultConfig = {
  site: {
    title: titleCase(yokoPath),
    description: 'Describe your site here',
    url: 'http://change.me'
  },
  collections: {
    example: {
      pattern: 'example/*.md',
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
    outputStyle: 'compressed'
  },
  autoprefixer: {
    browsers: 'last 2 versions'
  }
}

// Blank theme settings
const blankConfig = {
  site: {
    title: titleCase(yokoPath),
    description: 'Describe your site here',
    url: 'http://change.me'
  }
}

/* Check for the [theme] argument first */
if (yoko.theme) {
  const themeIsValid = /^(github|gitlab|bitbucket):\S*\/\S*$/.test(yoko.theme)

  // Make sure the user is making a valid request using the format host:username/repository
  if (themeIsValid) {
    const themeName = yoko.theme.replace(/[^/]*\//, '')
    const themeHost = /[^:]*/.exec(yoko.theme)

    // Notify the user that we're attempting to download the requested theme
    console.log(`Downloading ${titleCase(themeName)} from ${titleCase(themeHost)}...`)

    // Download the requested theme to <path>
    downloadTheme(yoko.theme, yokoPath, err => {
      if (err) {
        return console.error(err)
      } else {
        console.log('New site created. Happy coding!')
      }
    })
  } else {
    console.error('Invalid theme')
  }
  // Check for the --blank option
} else if (yoko.blank) {
  // Use the blank theme
  fs.copy(`${__dirname}/../themes/blank`, yokoPath, err => {
    if (err) {
      return console.error(err)
    } else {
      console.log('New blank site created. Happy coding!')
    }

    // Create a settings file
    settings.set(blankConfig)
    settings.save()
  })
  // No [theme] argument or --blank option supplied
} else {
  // Use the default theme
  fs.copy(`${__dirname}/../themes/kitsune`, yokoPath, err => {
    if (err) {
      return console.error(err)
    } else {
      console.log('New site created. Happy coding!')
    }

    // Create a settings file
    settings.set(defaultConfig)
    settings.save()
  })
}
