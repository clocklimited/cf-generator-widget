var assert = require('assert')
  , fs = require('fs')
  , template = require('lodash.template')

describe('package.json template', function () {

  it('should generate valid json', function () {

    var tmpl = template(fs.readFileSync(__dirname + '/../templates/package.json.tpl'))
      , mockSettings =
          { platform: 'test'
          , description: 'test'
          , organization: 'test'
          }
      , json = tmpl(mockSettings)

    assert.doesNotThrow(function () { JSON.parse(json) })
    assert.equal(JSON.parse(json).name, 'test')

  })

})
