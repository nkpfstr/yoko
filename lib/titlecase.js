'use strict'

const capitalize = require('./capitalize')

module.exports = function (string) {
  /*
    titlecase(string)
    ---
    Capitalize the first letter of every word in a given string
  */

  // Replace dashes with spaces
  let words = string.replace(/-/g, ' ').split(' ')

  // Capitalize each word in the array
  for (let i = 0; i < words.length; i++) {
    words[i] = capitalize(words[i])
  }

  return words.join(' ')
}
