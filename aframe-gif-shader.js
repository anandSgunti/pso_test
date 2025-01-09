a-frame: gif shader
this project demonstrates how to use a gif as a texture in a-frame

!(function (t) {
  function e(r) {
    if (i[r]) return i[r].exports; const a = i[r] = {exports: {}, id: r, loaded: !1}; return t[r].call(a.exports, a, a.exports, e), a.loaded = !0, a.exports
  } var i = {}; return e.m = t, e.c = i, e.p = '', e(0)
}([function (t, e, i) {
  function r(t, e) {
    return {status: 'error', src: e, message: t, timestamp: Date.now()}
  } const a = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (t) {
    return typeof t
  } : function (t) {
    return t && typeof Symbol === 'function' && t.constructor === Symbol ? 'symbol' : typeof t
  }; const s = i(1); if (typeof AFRAME === 'undefined') throw 'Component attempted to register before AFRAME was available.'; const n = AFRAME.utils.srcLoader.parseUrl; const o = AFRAME.utils.debug; o.enable('shader:gif:warn'); const _ = o('shader:gif:warn'); const h = o('shader:gif:debug'); const u = {}; AFRAME.registerShader('gif', {
    schema: {color: {type: 'color'}, fog: {'default': !0}, src: {'default': null}, autoplay: {'default': !0}},
    init(t) {
      return h('init', t), h(this.el.components), this.__cnv = document.createElement('canvas'), this.__cnv.width = 2, this.__cnv.height = 2, this.__ctx = this.__cnv.getContext('2d'), this.__texture = new THREE.Texture(this.__cnv), this.__material = {}, this.__reset(), this.material = new THREE.MeshBasicMaterial({map: this.__texture}), this.el.sceneEl.addBehavior(this), this.__addPublicFunctions(), this.material
    },
    update(t) {
      return h('update', t), this.__updateMaterial(t), this.__updateTexture(t), this.material
    },
    tick(t) {
      this.__frames && !this.paused() && Date.now() - this.__startTime >= this.__nextFrameTime && this.nextFrame()
    },
    __updateMaterial(t) {
      const e = this.material; const i = this.__getMaterialData(t); Object.keys(i).forEach((t) => {
        e[t] = i[t]
      })
    },
    __getMaterialData(t) {
      return {fog: t.fog, color: new THREE.Color(t.color)}
    },
    __setTexure(t) {
      h('__setTexure', t), t.status === 'error' ? (_(`Error: ${t.message}\nsrc: ${t.src}`), this.__reset()) : t.status === 'success' && t.src !== this.__textureSrc && (this.__reset(), this.__ready(t))
    },
    __updateTexture(t) {
      const e = t.src; const i = t.autoplay; typeof i === 'boolean' ? this.__autoplay = i : typeof i === 'undefined' && (this.__autoplay = !0), this.__autoplay && this.__frames && this.play(), e ? this.__validateSrc(e, this.__setTexure.bind(this)) : this.__reset()
    },
    __validateSrc(t, e) {
      const i = n(t); if (i) return void this.__getImageSrc(i, e); let s = void 0; const o = this.__validateAndGetQuerySelector(t); if (o && (typeof o === 'undefined' ? 'undefined' : a(o)) === 'object') {
        if (o.error)s = o.error; else {
          const _ = o.tagName.toLowerCase(); if (_ === 'video')t = o.src, s = 'For video, please use `aframe-video-shader`'; else {
            if (_ === 'img') return void this.__getImageSrc(o.src, e); s = `For <${_}> element, please use \`aframe-html-shader\``
          }
        }s && !(function () {
          const i = u[t]; const a = r(s, t); i && i.callbacks ? i.callbacks.forEach(t => t(a)) : e(a), u[t] = a
        }())
      }
    },
    __getImageSrc(t, e) {
      function i(e) {
        const i = r(e, t); n.callbacks && (n.callbacks.forEach(t => t(i)), u[t] = i)
      } const a = this; if (t !== this.__textureSrc) {
        var n = u[t]; if (n && n.callbacks) {
          if (n.src) return void e(n); if (n.callbacks) return void n.callbacks.push(e)
        } else n = u[t] = {callbacks: []}, n.callbacks.push(e); const o = new Image(); o.crossOrigin = 'Anonymous', o.addEventListener('load', (e) => {
          a.__getUnit8Array(t, e => (e ? void (0, s.parseGIF)(e, (e, i, r) => {
            let a = {status: 'success', src: t, times: e, cnt: i, frames: r, timestamp: Date.now()}; n.callbacks && (n.callbacks.forEach(t => t(a)), u[t] = a)
          }, t => i(t)) : void i('This is not gif. Please use `shader:flat` instead')))
        }), o.addEventListener('error', t => i('Could be the following issue\n - Not Image\n - Not Found\n - Server Error\n - Cross-Origin Issue')), o.src = t
      }
    },
    __getUnit8Array(t, e) {
      if (typeof e === 'function') {
        const i = new XMLHttpRequest(); i.open('GET', t), i.responseType = 'arraybuffer', i.addEventListener('load', (t) => {
          for (var i = new Uint8Array(t.target.response), r = i.subarray(0, 4), a = '', s = 0; s < r.length; s++)a += r[s].toString(16); a === '47494638' ? e(i) : e()
        }), i.addEventListener('error', (t) => {
          h(t), e()
        }), i.send()
      }
    },
    __validateAndGetQuerySelector(t) {
      try {
        const e = document.querySelector(t); return e || {error: 'No element was found matching the selector'}
      } catch (i) {
        return {error: 'no valid selector'}
      }
    },
    __addPublicFunctions() {
      this.el.gif = {play: this.play.bind(this), pause: this.pause.bind(this), togglePlayback: this.togglePlayback.bind(this), paused: this.paused.bind(this), nextFrame: this.nextFrame.bind(this)}
    },
    pause() {
      h('pause'), this.__paused = !0
    },
    play() {
      h('play'), this.__paused = !1
    },
    togglePlayback() {
      this.paused() ? this.play() : this.pause()
    },
    paused() {
      return this.__paused
    },
    nextFrame() {
      for (this.__draw(); Date.now() - this.__startTime >= this.__nextFrameTime;) this.__nextFrameTime += this.__delayTimes[this.__frameIdx++], (this.__infinity || this.__loopCnt) && this.__frameCnt <= this.__frameIdx && (this.__frameIdx = 0)
    },
    __clearCanvas() {
      this.__ctx.clearRect(0, 0, this.__width, this.__height), this.__texture.needsUpdate = !0
    },
    __draw() {
      this.__ctx.drawImage(this.__frames[this.__frameIdx], 0, 0, this.__width, this.__height), this.__texture.needsUpdate = !0
    },
    __ready(t) {
      const e = t.src; const i = t.times; const r = t.cnt; const a = t.frames; h('__ready'), this.__textureSrc = e, this.__delayTimes = i, r ? this.__loopCnt = r : this.__infinity = !0, this.__frames = a, this.__frameCnt = i.length, this.__startTime = Date.now(), this.__width = THREE.Math.floorPowerOfTwo(a[0].width), this.__height = THREE.Math.floorPowerOfTwo(a[0].height), this.__cnv.width = this.__width, this.__cnv.height = this.__height, this.__draw(), this.__autoplay ? this.play() : this.pause()
    },
    __reset() {
      this.pause(), this.__clearCanvas(), this.__startTime = 0, this.__nextFrameTime = 0, this.__frameIdx = 0, this.__frameCnt = 0, this.__delayTimes = null, this.__infinity = !1, this.__loopCnt = 0, this.__frames = null, this.__textureSrc = null
    },
  })
}, function (t, e) {
  e.parseGIF = function (t, e, i) {
    let r = 0; const a = []; let s = 0; let n = null; var o = null; const _ = []; let h = 0; if (t[0] === 71 && t[1] === 73 && t[2] === 70 && t[3] === 56 && t[4] === 57 && t[5] === 97) {
      r += 13 + +!!(128 & t[10]) * Math.pow(2, (7 & t[10]) + 1) * 3; for (let u = t.subarray(0, r); t[r] && t[r] !== 59;) {
        const c = r; const l = t[r]; if (l === 33) {
          const f = t[++r]; if ([1, 254, 249, 255].indexOf(f) === -1) {
            i && i('parseGIF: unknown label'); break
          } for (f === 249 && a.push(10 * (t[r + 3] + (t[r + 4] << 8))), f === 255 && (h = t[r + 15] + (t[r + 16] << 8)); t[++r];)r += t[r]; f === 249 && (n = t.subarray(c, r + 1))
        } else {
          if (l !== 44) {
            i && i('parseGIF: unknown blockId'); break
          } for (r += 9, r += 1 + +!!(128 & t[r]) * (3 * Math.pow(2, (7 & t[r]) + 1)); t[++r];)r += t[r]; var o = t.subarray(c, r + 1); _.push(URL.createObjectURL(new Blob([u, n, o])))
        }r++
      }
    } else i && i('parseGIF: no GIF89a'); if (_.length) {
      let d = document.createElement('canvas'); const m = function () {
        _.forEach((t, e) => {
          const i = new Image(); i.onload = function (t, e) {
            e === 0 && (d.width = i.width, d.height = i.height), s++, _[e] = this, s === _.length && (s = 0, p(1))
          }.bind(i, null, e), i.src = t
        })
      }; var p = function g(t) {
        const i = new Image(); i.onload = function (t, i) {
          s++, _[i] = this, s === _.length ? (d = null, e && e(a, h, _)) : g(++i)
        }.bind(i), i.src = d.toDataURL('image/gif')
      }; m()
    }
  }
}]))
