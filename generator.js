module.exports = ProjectWidgetGenerator

var kickoff = require('kickoff')
  , Generator = kickoff.Generator
  , generate = kickoff.generate
  , extend = require('lodash.assign')
  , request = require('request')
  , allPartsData = null
  , partNames = []

function required (value) {
  return !!value
}

function ProjectWidgetGenerator () {
  Generator.call(this)
}

function getParts (cb) {

  var partsUrl = 'https://api.github.com/repos/clocklimited/parts-new/git/trees/master?recursive=1'
  request(
    {
      headers: {
        'User-Agent': 'Project Widget Generator'
      }
    , url: partsUrl
    , method: 'GET'
    }
  , function (err, res, body) {
    if (!err) {
      allPartsData = JSON.parse(body)
      allPartsData.tree.forEach(function (item) {
        if (item.type === 'tree') {
          var partCheck = item.path.match(/^Parts\/(\w+)$/)
          if (partCheck) {
            partNames.push(partCheck[1])
            return true
          }
        }
      })
      console.log(partNames)
      cb(null)
    } else {
      throw err
    }
  })
}

ProjectWidgetGenerator.prototype = Object.create(Generator.prototype)

ProjectWidgetGenerator.prototype.createConfig = function (userInput) {
  var config = {}
  return extend({}, userInput, config)
}

ProjectWidgetGenerator.prototype.prompts =
  [ { name: 'title'
    , message: 'Name this widget'
    , validate: required
    }
  , { name: 'description'
    , message: 'Describe this widget'
    , validate: required
    }
  , { type: 'list'
    , name: 'template'
    , message: 'Which widget template would you like to use?'
    , choices: ['Custom']
    }
  ]

ProjectWidgetGenerator.prototype._generate = function (path, config, cb) {
  getParts(function (err) {
    if (err) throw err
    generate(__dirname, path, config, cb)
  })
}
