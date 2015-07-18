let EventEmitter = require('events').EventEmitter
let Canvas = require('./view/canvas')
let LoadIndicator = require('./view/load-indicator')
let ProgressBar = require('./view/progress-bar')

class ComicBook extends EventEmitter {

  constructor (srcs = []) {
    super()

    // requested image srcs
    this.srcs = srcs

    // loaded image objects
    this.pages = new Map()

    this.preloadBuffer = 4

    // TODO move this logic into the router
    this.currentPageIndex = 0

    this.canvas = new Canvas()
    this.loadIndicator = new LoadIndicator()
    this.progressBar = new ProgressBar()

    this.addEventListeners()
  }

  addEventListeners () {
    this.on('preload:start', this.loadIndicator.show.bind(this.loadIndicator))
    this.on('preload:start', this.progressBar.show.bind(this.progressBar))
    this.on('preload:image', this.updateProgressBar.bind(this))
    this.on('preload:ready', this.loadIndicator.hide.bind(this.loadIndicator))
    this.on('preload:ready', this.drawPage.bind(this))
    this.on('preload:finish', this.progressBar.hide.bind(this.progressBar))
  }

  render () {
    this.el = document.createElement('div')
    this.el.appendChild(this.canvas.canvas)
    this.el.appendChild(this.progressBar.el)
    this.el.appendChild(this.loadIndicator.el)
    return this
  }

  preload () {
    this.emit('preload:start')

    this.srcs.forEach((src, pageIndex) => {
      let image = new window.Image()

      image.src = src
      image.onload = setImage.bind(this, image, pageIndex)

      function setImage (image, index) {
        this.pages.set(index, image)
        this.emit('preload:image', image)

        if (this.pages.size === this.preloadBuffer) {
          this.emit('preload:ready')
        }

        if (this.pages.size === this.srcs.length) {
          this.emit('preload:finish')
        }
      }
    })
  }

  updateProgressBar () {
    let percentage = Math.floor((this.pages.size / this.srcs.length) * 100)
    this.progressBar.update(percentage)
  }

  drawPage () {
    let page = this.pages.get(this.currentPageIndex)
    this.canvas.drawImage(page)
  }

  drawNextPage () {
    // TODO
  }

  drawPrevioousPage () {
    // TODO
  }
}

module.exports = ComicBook

