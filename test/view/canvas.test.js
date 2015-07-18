let assert = require('assert')
let imagediff = require('imagediff')
let Canvas = require('../../app/view/canvas')
let testImage = require('../data')
let fixtureImage = require('../fixture')

describe('Canvas', function () {

  it('should draw only Image objects', () => {
    let canvas = new Canvas()
    let image = new window.Image()

    assert.throws(canvas.drawImage, 'Invalid image')

    canvas.options.doublePage = true

    assert.throws(canvas.drawImage.bind(canvas, image), 'Invalid image')
    assert.doesNotThrow(canvas.drawImage.bind(canvas, image, image), 'Invalid image')
  })

  it('should draw a single page', (done) => {
    let canvas = new Canvas()
    testImage.portrait1((testImage) => {
      fixtureImage.singlePortrait((fixtureImage) => {
        canvas.drawImage(testImage)
        assert(imagediff.equal(canvas.canvas, fixtureImage, 5))
        done()
      })
    })
  })

  it('should draw a double page')

  it('should draw a manga double page')

  it('should draw a single double page spread')

  it('should show a blank last page if the last double page only has one image')

  it('should auto-fit to window width')

  it('should auto-fit to window height')

  it('should manual zoom')

  it('should always display the canvas 100% of window width, even when drawing smaller images')

  it('should always center pages')

  it('should prevent smaller images from being drawn on top of bigger ones')
})