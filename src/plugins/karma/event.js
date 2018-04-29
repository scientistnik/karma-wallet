/*
 * file: event.js
 * author: Nozdrin-Plotnitsky Nikalay <nozrin.plotnitsky@gmail.com>
 * license: MIT
 */

export default class Event {
  constructor() {
    this.init = false
    this.subs = new Set()
  }

  subscribe(callback) {
    this.subs.add(callback)

    if (this.init)
      callback()
  }

  unsubscribe(callback) {
    this.subs.delete(callback)
  }

  notify() {
    this.subs.forEach(sub => sub())
  }
}