'use strict'

const fs = require('fs-extra')
const log = require('lloogg')
const yaml = require('js-yaml')

module.exports = {
  /*
    config.write(properties, destination)
    ---
    Initialize a site config containing <properties> and write it to <destination>
  */
  write (properties, destination) {
    fs.outputFile(destination, yaml.dump(properties), err => {
      if (err) {
        return log.error(err)
      }

      log.success('Site configuration file created')
    })
  },

  /*
    config.read(file)
    ---
    Parse a site's config <file>
  */
  read (file) {
    return yaml.load(fs.readFileSync(file, 'utf-8'))
  }
}
