let EventEmitter = require('events').EventEmitter

// TODO replace
function windowWidth () {
  return window.innerWidth
}

class Canvas extends EventEmitter {

  constructor (options) {
    super()
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
  }

  drawImage (page, page2, opts = {}) {
    this.emit('draw:start')

    if (page2 === null || !(page2 instanceof window.Image)) {
      opts = page2 || opts
    }

    let options = Object.assign({
      doublePage: false,
      zoomMode: 'fitWidth'
    }, opts)

    if (!(page instanceof window.Image) || (options.doublePage && page2 === null)) {
      throw new Error('Invalid image')
    }

    let zoomScale
    let offsetW = 0
    let offsetH = 0
    let width = page.width
    let height = page.height
    let doublePageMode = options.doublePage
    let canvasWidth
    let canvasHeight
    let pageWidth
    let pageHeight

    // reset the canvas to stop duplicate pages showing
    this.canvas.width = 0
    this.canvas.height = 0

    // show double page spreads on a single page
    let isDoublePageSpread = (
      page2 &&
      (page.width > page.height || page2.width > page2.height) &&
      doublePageMode
    )

    if (isDoublePageSpread) doublePageMode = false

    if (doublePageMode) {

      // for double page spreads, factor in the width of both pages
      if (page2 instanceof window.Image) {
        width += page2.width
      // if this is the last page and there is no page2, still keep the canvas wide
      } else {
        width += width
      }
    }

    // update the page this.scale if a non manual mode has been chosen
    switch (options.zoomMode) {

    case 'manual':
      document.body.style.overflowX = 'auto'
      zoomScale = (doublePageMode) ? this.scale * 2 : this.scale
      break

    case 'fitWidth':
      document.body.style.overflowX = 'hidden'

      // this.scale up if the window is wider than the page, scale down if the window
      // is narrower than the page
      zoomScale = (windowWidth() > width) ? ((windowWidth() - width) / windowWidth()) + 1 : windowWidth() / width
      this.scale = zoomScale
      break

    case 'fitWindow':
      document.body.style.overflowX = 'hidden'

      let widthScale = (windowWidth() > width)
        ? ((windowWidth() - width) / windowWidth()) + 1 // scale up if the window is wider than the page
        : windowWidth() / width // scale down if the window is narrower than the page
      let windowHeight = window.innerHeight
      let heightScale = (windowHeight > height)
        ? ((windowHeight - height) / windowHeight) + 1 // scale up if the window is wider than the page
        : windowHeight / height // scale down if the window is narrower than the page

      zoomScale = (widthScale > heightScale) ? heightScale : widthScale
      this.scale = zoomScale
      break
    }

    canvasWidth = page.width * zoomScale
    canvasHeight = page.height * zoomScale

    pageWidth = (options.zoomMode === 'manual') ? page.width * this.scale : canvasWidth
    pageHeight = (options.zoomMode === 'manual') ? page.height * this.scale : canvasHeight

    canvasHeight = pageHeight

    // make sure the canvas is always at least full screen, even if the page is narrower than the screen
    this.canvas.width = (canvasWidth < windowWidth()) ? windowWidth() : canvasWidth
    this.canvas.height = (canvasHeight < window.innerHeight) ? window.innerHeight : canvasHeight

    // always keep pages centered
    if (options.zoomMode === 'manual' || options.zoomMode === 'fitWindow') {

      // work out a horizontal position
      if (canvasWidth < windowWidth()) {
        offsetW = (windowWidth() - pageWidth) / 2
        if (options.doublePage) { offsetW = offsetW - pageWidth / 2 }
      }

      // work out a vertical position
      if (canvasHeight < window.innerHeight) {
        offsetH = (window.innerHeight - pageHeight) / 2
      }
    }

    // draw the page(s)
    this.context.drawImage(page, offsetW, offsetH, pageWidth, pageHeight)
    if (options.doublePage && typeof page2 === 'object') {
      this.context.drawImage(page2, pageWidth + offsetW, offsetH, pageWidth, pageHeight)
    }

    this.emit('draw:finish')
  }
}

module.exports = Canvas
