'use strict'

module.exports = function (string) {
  /*
    capitalize(string)
    ---
    Capitalize the first letter of a given string
  */
  return string.charAt(0).toUpperCase() + string.slice(1)
}
