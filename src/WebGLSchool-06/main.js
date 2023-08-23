import GUI from 'lil-gui';
import { WebGLUtility }     from './script/webgl.js';
import { WebGLMath }        from './script/math.js';
import { WebGLGeometry }    from './script/geometry.js';
import { WebGLOrbitCamera } from './script/camera.js';

import vertexshader from './shader/main.vert?raw'
import fragmentshader from './shader/main.frag?raw'

window.addEventListener('DOMContentLoaded', () => {
  const app = new App()
  app.init()
  app.createProgramObject(vertexshader, fragmentshader)
  app.load().then(() => {
    app.setupGeometry()
    app.setupLocation()
    app.setBlending(true)
    app.setCulling(false)
    app.start()
  })

  // gui
  const gui = new GUI()
  const guiParam = {
    texture: true,
    blend: true, // ブレンドを有効化するかどうか @@@
  };
  gui.add(guiParam, 'blend').onChange(value => {
    app.setBlending(value);
  })
});

class App {
  constructor() {
    this.canvas = null
    this.gl = null
    this.program = null
    this.attributeLocation = null
    this.attributeStride = null
    this.uniformLocation = null

    this.camera = null
    
    // geometry
    this.geometry = null
    this.baloonVBO = null
    this.balloonIBO = null

    this.startTime = 0
    this.isRender = false
    this.isRotation = false

    this.resize = this.resize.bind(this)
    this.render = this.render.bind(this)

  }

  /**
   * ブレンディングを設定する @@@
   * @param {boolean} flag - 設定する値
   */
  setBlending(flag) {
    const gl = this.gl;
    if (gl == null) {return;}
    if (flag === true) {
      gl.enable(gl.BLEND);
    } else {
      gl.disable(gl.BLEND);
    }
  }
  

  /**
   * バックフェイスカリングを設定する
   * @param {boolean} flag - 設定する値
   */
  setCulling(flag) {
    const gl = this.gl
    if (gl === null) return
    if (flag) gl.enable(gl.CULL_FACE)
    else gl.disable(gl.CULL_FACE)
  }

  /**
   * 深度テストを設定する
   * @param {boolean} flag - 設定する値
   */
  setDepthTest(flag) {
    const gl = this.gl
    if (gl === null) return
    if (flag) gl.enable(gl.DEPTH_TEST)
    else gl.disable(gl.DEPTH_TEST)
  }

  /**
   * isRotation を設定する
   * @param {boolean} flag - 設定する値
   */
  setRotation(flag) {
    this.isRotation = flag;
  }

  /**
   * 初期化処理を行う
   */
  init() {
    this.canvas = document.getElementById('webgl-canvas')
    this.gl = WebGLUtility.createWebGLContext(this.canvas)
                    
    // OrbitControl Camera
    const cameraOption = {
      distance: 5.0, // Z 軸上の初期位置までの距離
      min: 1.0,      // カメラが寄れる最小距離
      max: 10.0,     // カメラが離れられる最大距離
      move: 2.0,     // 右ボタンで平行移動する際の速度係数
    }
    this.camera = new WebGLOrbitCamera(this.canvas, cameraOption)

    // バックフェイスカリングと深度テストは初期状態で有効
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    

    this.resize()
    // リサイズイベントの設定
    window.addEventListener('resize', this.resize, false);

          /*   
            resize() {
              this.canvas.width = window.innerWidth
              this.canvas.height = window.innerHeight
            }
          */  
  }

  createProgramObject(vert, frag) {
    const gl = this.gl
    if (gl == null) {
      const error = new Error('not initialized')
    } else {
      const vs = WebGLUtility.createShaderObject(gl, vert, gl.VERTEX_SHADER)
      const fs = WebGLUtility.createShaderObject(gl, frag, gl.FRAGMENT_SHADER)
      this.program = WebGLUtility.createProgramObject(gl, vs, fs)
    }
  }

  setupGeometry() {
    const color = [1.0, 1.0, 1.0, 1.0];

    const row = 24
    const column = 72
    const rad = 1

    this.geometry = WebGLGeometry.sphere(row, column, rad, color)

    this.baloonVBO = [
      WebGLUtility.createVBO(this.gl, this.geometry.position),
      WebGLUtility.createVBO(this.gl, this.geometry.normal),
      WebGLUtility.createVBO(this.gl, this.geometry.color),
      WebGLUtility.createVBO(this.gl, this.geometry.texCoord), //テクスチャ座標 @@@
      // for balloon
      WebGLUtility.createVBO(this.gl, this.geometry.addNor),

    ]

    this.balloonIBO = WebGLUtility.createIBO(this.gl, this.geometry.index);
  }

  setupLocation() {
    const gl = this.gl

    this.attributeLocation = [
      gl.getAttribLocation(this.program, 'position'),
      gl.getAttribLocation(this.program, 'normal'),
      gl.getAttribLocation(this.program, 'color'),
      gl.getAttribLocation(this.program, 'uv'), // テクスチャ座標 @@@
      // for balloon
      gl.getAttribLocation(this.program, 'addNor'),
    ]

        // ERROR: 128WebGL: INVALID_VALUE: enableVertexAttribArray: index out of range
        console.log(this.attributeLocation);  // (5) [0, 1, 2, 3, -1] ??????????????????
        this.attributeLocation = [0, 1, 2, 3, 4]

    this.attributeStride = [
      3,
      3,
      4,
      2,
      // for balloon
      3,
    ]

    this.uniformLocation = {
      mvpMatrix: gl.getUniformLocation(this.program, 'mvpMatrix'),
      normalMatrix: gl.getUniformLocation(this.program, 'normalMatrix'),
      uTime: gl.getUniformLocation(this.program, 'uTime'),
      normalTexUnit: gl.getUniformLocation(this.program, 'normalTexUnit'), // uniform 変数のロケーション @@@,
      colorTexUnit: gl.getUniformLocation(this.program, 'colorTexUnit'), // uniform 変数のロケーション @@@,
      mMatrix: gl.getUniformLocation(this.program, 'mMatrix'),
    }
  }


  setupRendering() {
    const gl = this.gl
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0.3, 0.3, 0.3, 1.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // ブレンドの設定 @@@
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
        // その他の設定例（加算合成＋アルファで透明）
        // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
    
  }

  start() {
    this.startTime = Date.now()
    this.isRender = true
    this.render()
  }

  stop() {
    this.isRender = false
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  render () {
    const gl = this.gl
    const m4 = WebGLMath.Mat4
    const v3 = WebGLMath.Vec3

    if (this.isRender === true) {
      requestAnimationFrame(this.render)
    }

    // 現在までの経過時間 = elapsed
    const nowTime = (Date.now() - this.startTime) * 0.001;
    const uTime = Math.abs(Math.sin(nowTime * 0.3))

    // レンダリングのセットアップ(画面のリサイズ(？)とクリア)
    this.setupRendering()

    // 上下移動
    const modelMatrix = m4.translate(m4.identity(), [0.0, uTime, 0.0])

    // モデル座標変換行列の、逆転置行列を生成する @@@
    const normalMatrix = m4.transpose(m4.inverse(modelMatrix))

    // ビュー・プロジェクション座標変換行列
    const viewMatrix = this.camera.update()
    const fovy   = 45
    const aspect = window.innerWidth / window.innerHeight
    const near   = 0.1
    const far    = 10.0
    const projectionMatrix = m4.perspective(fovy, aspect, near, far)
    // 行列を乗算して MVP 行列を生成する（掛ける順序に注意）
    const vp = m4.multiply(projectionMatrix, viewMatrix)
    const mvp = m4.multiply(vp, modelMatrix)

    // テクスチャを０番ユニットにバインドする @@@
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.normalTexture)

    // テクスチャを1番ユニットにバインドする @@@
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture)
    
    // プログラムオブジェクトを選択し uniform 変数を更新する @@@
    gl.useProgram(this.program)
    gl.uniformMatrix4fv(this.uniformLocation.mvpMatrix, false, mvp)
    gl.uniformMatrix4fv(this.uniformLocation.normalMatrix, false, normalMatrix)
    gl.uniform1f(this.uniformLocation.uTime, uTime)
    gl.uniform1i(this.uniformLocation.normalTexUnit, 0); // テクスチャユニットの番号を送る @@@
    gl.uniform1i(this.uniformLocation.colorTexUnit, 1); // テクスチャユニットの番号を送る @@@
    gl.uniformMatrix4fv(this.uniformLocation.mMatrix, false, modelMatrix);

    // VBO と IBO を設定し、描画する
    WebGLUtility.enableBuffer(gl, this.baloonVBO, this.attributeLocation, this.attributeStride, this.balloonIBO)
    gl.drawElements(gl.TRIANGLES, this.geometry.index.length, gl.UNSIGNED_SHORT, 0)

  }

  load() {
    return new Promise((resolve, reject) => {
      const gl = this.gl
      if (gl == null) {
        const error = new Error('not initialized')
        reject(error)
      } else {
          // 画像の読み込み @@@
          const pTex1 = WebGLUtility.loadImage('texture/wrinkle-normal.jpg').then(img => {
            // 読み込んだ画像からテクスチャを生成 @@@
            this.normalTexture = WebGLUtility.createTexture(gl, img)
          })
          // 画像の読み込み @@@
          const pTex2 = WebGLUtility.loadImage('texture/balloon-d1.png').then(img => {
            // 読み込んだ画像からテクスチャを生成 @@@
            this.colorTexture = WebGLUtility.createTexture(gl, img)
          })
          // Promise を解決
          Promise.all([pTex1, pTex2]).then(resolve)
          // resolve()
      }
    })
  }





}
