const request = require('request')

module.exports = function (options: any) {
  return new Promise(function (resolve, reject) {
    request(options, function (error: Error | null, response: any, body: any) {
      if (error)
        reject(error)
      else if (response.statusCode < 200 || response.statusCode >= 300)
        reject(new Error(response.statusCode + ' ' + response.statusMessage + ': ' + JSON.stringify(options)))
      else
        resolve(body)
    })
  })
}