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
  app.setupGeometry()
  app.setupLocation()
  app.setBlending(true)
  app.setCulling(false)
  app.start()

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
    this.sphereModelMatrix = null
    this.geometry = null
    this.torusVBO = null
    this.torusIBO = null

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

          /*  
            static createWebGLContext(canvas) {
              const gl = canvas.getContext('webgl');
              if (gl == null) {
                throw new Error('webgl not supported');
                return null;
              } else {
                return gl;
              }
            } 
          */
                    
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
    const column = 128
    const rad = 1

    this.geometry = WebGLGeometry.sphere(row, column, rad, color)

       /**
       * 球体の頂点情報を生成する
       * @param {number} row - 球の縦方向（緯度方向）の分割数
       * @param {number} column - 球の横方向（経度方向）の分割数
       * @param {number} rad - 球の半径
       * @param {Array.<number>} color - RGBA を 0.0 から 1.0 の範囲で指定した配列
       * @return {object}
       * @property {Array.<number>} position - 頂点座標
       * @property {Array.<number>} normal - 頂点法線
       * @property {Array.<number>} color - 頂点カラー
       * @property {Array.<number>} texCoord - テクスチャ座標
       * @property {Array.<number>} index - 頂点インデックス（gl.TRIANGLES）
       * @example
       * const sphereData = WebGLGeometry.sphere(64, 64, 1.0, [1.0, 1.0, 1.0, 1.0]);
       */

    this.torusVBO = [
      WebGLUtility.createVBO(this.gl, this.geometry.position),
      WebGLUtility.createVBO(this.gl, this.geometry.normal),
      WebGLUtility.createVBO(this.gl, this.geometry.color),
      WebGLUtility.createVBO(this.gl, this.geometry.texCoord),
          /* 
            static createVBO(gl, vertexArray) {
              const vbo = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
              gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);
              gl.bindBuffer(gl.ARRAY_BUFFER, null);
              return vbo;
            }
          */
    ]

    this.torusIBO = WebGLUtility.createIBO(this.gl, this.geometry.index);
          /* 
            static createIBO(gl, indexArray) {
              const ibo = gl.createBuffer();
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
              gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indexArray), gl.STATIC_DRAW);
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
              return ibo;
          */    

    const m4 = WebGLMath.Mat4
    this.sphereModelMatrix = m4.scale(m4.identity(), [ 1.0, 1.0, 1.0 ])

  }

  setupLocation() {
    const gl = this.gl

    this.attributeLocation = [
      gl.getAttribLocation(this.program, 'position'),
      gl.getAttribLocation(this.program, 'normal'),
      gl.getAttribLocation(this.program, 'color'),
      gl.getAttribLocation(this.program, 'uv'),
    ]

    this.attributeStride = [
      3,
      3,
      4,
      2,
    ]

    this.uniformLocation = {
      mvpMatrix: gl.getUniformLocation(this.program, 'mvpMatrix'),
      normalMatrix: gl.getUniformLocation(this.program, 'normalMatrix'),
      uTime: gl.getUniformLocation(this.program, 'uTime')
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

    // レンダリングのセットアップ(画面のリサイズ(？)とクリア)
    this.setupRendering()

    // 回転
    const rotateAxis = v3.create(0.0, 1.0, 0.0)
    // const modelMatrix = m4.rotate(m4.identity(), nowTime, rotateAxis)
    // const modelMatrix = m4.rotate(this.sphereModelMatrix, nowTime * 0.5, rotateAxis)
    const modelMatrix = this.sphereModelMatrix

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

    // モデル座標変換行列の、逆転置行列を生成する @@@
    const normalMatrix = m4.transpose(m4.inverse(modelMatrix))

    // プログラムオブジェクトを選択し uniform 変数を更新する @@@
    gl.useProgram(this.program)
    gl.uniformMatrix4fv(this.uniformLocation.mvpMatrix, false, mvp)
    gl.uniformMatrix4fv(this.uniformLocation.normalMatrix, false, normalMatrix)
    gl.uniform1f(this.uniformLocation.uTime, Math.abs(Math.sin(nowTime * 0.2)))

    // VBO と IBO を設定し、描画する
    WebGLUtility.enableBuffer(gl, this.torusVBO, this.attributeLocation, this.attributeStride, this.torusIBO)
            /* 
                static enableBuffer(gl, vbo, attLocation, attStride, ibo) {
                  for (let i = 0; i < vbo.length; ++i) {
                    // 有効化したいバッファをまずバインドする
                    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
                    // 頂点属性ロケーションの有効化を行う
                    gl.enableVertexAttribArray(attLocation[i]);
                    // 対象のロケーションのストライドやデータ型を設定する
                    gl.vertexAttribPointer(attLocation[i], attStride[i], gl.FLOAT, false, 0, 0);
                  }
                  if (ibo != null) {
                    // IBO が与えられている場合はバインドする
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
                  }
                }
              
            */    
  gl.drawElements(gl.TRIANGLES, this.geometry.index.length, gl.UNSIGNED_SHORT, 0)

  }

  // load() {
  //   return new Promise((resolve, reject) => {
  //     const gl = this.gl
  //     if (gl == null) {
  //       const error = new Error('not initialized')
  //       reject(error)
  //     } else {
  //         vs = WebGLUtility.createShaderObject(gl, vertexshader, gl.VERTEX_SHADER)
  //         fs = WebGLUtility.createShaderObject(gl, fragmentshader, gl.FRAGMENT_SHADER)
  //         this.program = WebGLUtility.createProgramObject(gl, vs, fs)
  //         // Promise を解決
  //         resolve()
  //     }
  //   })
  // }





}
