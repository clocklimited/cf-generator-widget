module.exports = ProjectWidgetGenerator

var kickoff = require('kickoff')
  , inquirer = require('inquirer')
  , Generator = kickoff.Generator
  , generate = kickoff.generate
  , extend = require('lodash.assign')
  , request = require('request')
  , async = require('async')
  , join = require('path').join
  , fs = require('fs')
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
  ]
ProjectWidgetGenerator.prototype.generate = function (dest, cb) {
  getParts(function (err) {
    if (err) throw err
    this.prompts.push(
      { type: 'list'
      , name: 'template'
      , message: 'Which widget template would you like to use?'
      , choices: partNames
      }
    )
    inquirer.prompt(this.prompts, function (userInput) {
      var config = require(join(dest, 'config.json'))
      async.series(
        [
          function () {
            // Get Stylus
            var stylusDest = join(dest, config.global.componentsPath.stylus)
              , stylusFiles = []
            if (fs.statSync(stylusDest).isDirectory()) {
              allPartsData.tree.forEach(function (item) {
                if (item.type === 'blob') {
                  var regExp = new RegExp('^Parts\\/' + userInput.template + '\\/source\\/stylus\\/([\\w-]+)\\.styl$')
                    , partCheck = item.path.match(regExp)
                  if (partCheck) {
                    stylusFiles.push(item.url)
                  }
                }
              })
              // stylusFiles.forEach(function (file) {
              //   fs.writeFileSync(stylusDest, template(fs.readFileSync(src))(settings))
              // })
            }
          }
        , function () {
            // Get JS
          }
        , function () {
            // Get Site Component
          }
        , function () {
            // Get Admin Component
          }
        ]
      , function () {
          this._generate(dest, this.createConfig(userInput), cb)
        }.bind(this)
      )
    }.bind(this))
  }.bind(this))
}
ProjectWidgetGenerator.prototype._generate = function (path, config, cb) {
  generate(__dirname, path, config, cb)
}
