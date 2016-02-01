module.exports = ProjectWidgetGenerator

var kickoff = require('kickoff')
  , inquirer = require('inquirer')
  , Generator = kickoff.Generator
  , generate = kickoff.generate
  , extend = require('lodash.assign')
  , slugg = require('slugg')
  , availableTemplates =
      [
        'Custom'
      , 'Tabbed List'
      ]

function required (value) {
  return !!value
}

function ProjectWidgetGenerator () {
  Generator.call(this)
}

ProjectWidgetGenerator.prototype = Object.create(Generator.prototype)

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
    , choices: availableTemplates
    }
  ]

ProjectWidgetGenerator.prototype._generate = function (path, config, cb) {
  generate(__dirname, path, config, cb)
}
