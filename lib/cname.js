'use strict'

const fs = require('fs-extra')
const log = require('lloogg')

module.exports = function (domain, dest) {
  /*
    cname(domain, dest)
    ---
    Strip the protocol from <domain> and write it to a CNAME file in <dest>
  */
  let protocol = 'http://' || 'https://'

  // Strip protocol from domain if present
  if (domain.startsWith(protocol)) {
    domain = domain.replace(/^https?:\/\//, '')
  }

  // Generate CNAME file
  return fs.outputFile(`${dest}/CNAME`, domain, err => {
    if (err) {
      log.error(err)
    }
  })
}
