// モジュールを読み込み
import { WebGLUtility } from './webglUtility.js';
import * as star from './star.js'
import * as pentagon from './pentagon.js'
import GUI from 'lil-gui'

/**
 * アプリケーション管理クラス
 */
export default class App {
  /**
   * @constructro
   */
  constructor() {
    /**
     * WebGL で描画対象となる canvas
     * @type {HTMLCanvasElement}
     */
    this.canvas = null;
    /**
     * WebGL コンテキスト
     * @type {WebGLRenderingContext}
     */
    this.gl = null;
    /**
     * プログラムオブジェクト
     * @type {WebGLProgram}
     */
    this.program = null;
    this.program_penta = null;
    /**
     * uniform 変数のロケーションを保持するオブジェクト
     * @type {object.<WebGLUniformLocation>}
     */
    this.uniformLocation = null;
    this.uniformLocation_penta = null;
    /**
     * 頂点の座標を格納する配列
     * @type {Array.<number>}
     */
    this.position = null;
    this.position_penta = null;
    /**
     * 頂点の座標を構成する要素数（ストライド）
     * @type {number}
     */
    this.positionStride = null;
    this.positionStride_penta = null;
    /**
     * 座標の頂点バッファ
     * @type {WebGLBuffer}
     */
    this.positionVBO = null;
    this.positionVBO_penta = null;
    /**
     * 頂点の色を格納する配列
     * @type {Array.<number>}
     */
    this.color = null;
    this.color_penta = null;
    /**
     * 頂点の色を構成する要素数（ストライド）
     * @type {number}
     */
    this.colorStride = null;
    this.colorStride_penta = null;
    /**
     * 色の頂点バッファ
     * @type {WebGLBuffer}
     */
    this.colorVBO = null;
    this.colorVBO_penta = null;
    /**
     * レンダリング開始時のタイムスタンプ
     * @type {number}
     */
    this.startTime = 0
    this.currentTime = 0
    this.elapsedTime = 0
    this.delta = 0
    /**
     * レンダリングを行うかどうかのフラグ
     * @type {boolean}
     */
    this.isRender = false;

    // this を固定するためのバインド処理
    this.render = this.render.bind(this);

    /* 
    * GUI
    */
    this.guiParam = {}
  }

  /**
   * 初期化処理を行う
   */
  init() {
    // レンダリング開始時のタイムスタンプを取得しておく
    this.startTime = Date.now();

    // - WebGL コンテキストを初期化する ---------------------------------------
    // WebGL の様々な命令や設定値は WebGLRenderingContext という正式名称で、HTML
    // の canvas 要素から getContext('webgl') のようにメソッドを呼びだすことで取
    // 得することができます。
    // もし、ここでコンテキストを取得することができなかった場合、その環境上では
    // WebGL を利用することができません。
    // ------------------------------------------------------------------------
    this.canvas = document.getElementById('webgl-canvas');
    this.gl = WebGLUtility.createWebGLContext(this.canvas);

                // static createWebGLContext(canvas) {
                //   // canvas から WebGL コンテキスト取得を試みる
                //   const gl = canvas.getContext('webgl');
                //   if (gl == null) {
                //     // WebGL コンテキストが取得できない場合はエラー
                //     throw new Error('webgl not supported');
                //     return null;
                //   } else {
                //     return gl;
                //   }
                // }
  

    // - キャンバスの初期サイズ -----------------------------------------------
    // HTML の canvas 要素は、既定での大きさは 300 x 150 ピクセル程度に設定され
    // ているので、これを任意の大きさに変更しておきます。
    // ここでは、学習しやすさを考慮して、ウィンドウのクライアント領域の幅と高さ
    // のうち「短い辺」に縦横の長さを一致させておきます。
    // ※いずれフルスクリーンで実装します
    // ------------------------------------------------------------------------
    const size = Math.min(window.innerWidth, window.innerHeight);
    this.canvas.width  = size;
    this.canvas.height = size;
  }

  /**
   * 各種リソースのロードを行う
   * @return {Promise}
   */
  load() {
    return new Promise((resolve, reject) => {

        // Promise を解決
        resolve();
    })
  }

  createProgram() {
    // 変数に WebGL コンテキストを代入しておく（コード記述の最適化）
    const gl = this.gl;
    // WebGL コンテキストがあるかどうか確認する
    if (gl == null) {
      // もし WebGL コンテキストがない場合はエラーとして Promise を reject する
      const error = new Error('not initialized');
      reject(error);
    } else {
      const starVert = WebGLUtility.createShaderObject(gl, star.vs, gl.VERTEX_SHADER);
      const pentaVert = WebGLUtility.createShaderObject(gl, pentagon.vs, gl.VERTEX_SHADER);

                    // static createShaderObject(gl, source, type) {
                    //   // 空のシェーダオブジェクトを生成する
                    //   const shader = gl.createShader(type);
                    //   // シェーダオブジェクトにソースコードを割り当てる
                    //   gl.shaderSource(shader, source);
                    //   // シェーダをコンパイルする
                    //   gl.compileShader(shader);
                    //   // コンパイル後のステータスを確認し問題なければシェーダオブジェクトを返す
                    //   if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    //     return shader;
                    //   } else {
                    //     throw new Error(gl.getShaderInfoLog(shader));
                    //     return null;
                    //   }
                    // }

      const starFrag = WebGLUtility.createShaderObject(gl, star.fs, gl.FRAGMENT_SHADER);
      const pentaFrag = WebGLUtility.createShaderObject(gl, pentagon.fs, gl.FRAGMENT_SHADER);
      // - プログラムオブジェクト -----------------------------------------
      // ------------------------------------------------------------------
      this.program = WebGLUtility.createProgramObject(gl, starVert, starFrag);
      this.program_penta = WebGLUtility.createProgramObject(gl, pentaVert, pentaFrag);

                    // static createProgramObject(gl, vs, fs) {
                    //   // 空のプログラムオブジェクトを生成する
                    //   const program = gl.createProgram();
                    //   // ２つのシェーダをアタッチ（関連付け）する
                    //   gl.attachShader(program, vs);
                    //   gl.attachShader(program, fs);
                    //   // シェーダオブジェクトをリンクする
                    //   gl.linkProgram(program);
                    //   // リンクが完了するとシェーダオブジェクトは不要になるので削除する
                    //   gl.deleteShader(vs);
                    //   gl.deleteShader(fs);
                    //   // リンク後のステータスを確認し問題なければプログラムオブジェクトを返す
                    //   if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    //     gl.useProgram(program);
                    //     return program;
                    //   } else {
                    //     throw new Error(gl.getProgramInfoLog(program));
                    //     return null;
                    //   }
                    // }
    }
  }

  setupMesh() {
    const gl = this.gl
    /**
     * 頂点属性（頂点ジオメトリ）のセットアップを行う
     */

  // star
    // position
    this.positionStride = 3;
    this.vertexCount = star.positions.length / this.positionStride
    // VBO を生成
    this.positionVBO = WebGLUtility.createVBO(this.gl, star.positions);
    
    // color
    this.colorStride = 4;
    // VBO を生成
    this.colorVBO = WebGLUtility.createVBO(this.gl, star.colors);

  // pentagon
    // position
    this.positionStride_penta = 3;
    this.vertexCount_penta = pentagon.positions.length / this.positionStride_penta
    // VBO を生成
    this.positionVBO_penta = WebGLUtility.createVBO(this.gl, pentagon.positions);

    // color
    this.colorStride_penta = 4;
    // VBO を生成
    this.colorVBO_penta = WebGLUtility.createVBO(this.gl, pentagon.colors);

    /**
     * 頂点属性のロケーションに関するセットアップを行う
     */

  // star
    const attPosition = gl.getAttribLocation(this.program, 'position');
    const attColor = gl.getAttribLocation(this.program, 'color');
    // attribute location の有効化
    WebGLUtility.enableAttribute(gl, this.positionVBO, attPosition, this.positionStride);
    WebGLUtility.enableAttribute(gl, this.colorVBO, attColor, this.colorStride);

                // static enableAttribute(gl, vbo, attLocation, attStride) {
                //   // 有効化したいバッファをまずバインドする
                //   gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
                //   // 頂点属性ロケーションの有効化を行う
                //   gl.enableVertexAttribArray(attLocation);
                //   // 対象のロケーションのストライドやデータ型を設定する
                //   gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);
                // }

    // uniform location の取得
    this.uniformLocation = {
      time: gl.getUniformLocation(this.program, 'time'),
    };

  // pentagon
    // const attPosition_penta = gl.getAttribLocation(this.program_penta, 'position');
    // const attColor_penta = gl.getAttribLocation(this.program_penta, 'color');
    // // attribute location の有効化
    // WebGLUtility.enableAttribute(gl, this.positionVBO_penta, attPosition_penta, this.positionStride_penta);
    // WebGLUtility.enableAttribute(gl, this.colorVBO_penta, attColor_penta, this.colorStride_penta);

    // // uniform location の取得
    // this.uniformLocation_penta = {
    //   time: gl.getUniformLocation(this.program_penta, 'time'),
    // };
    
  }

  /**
   * レンダリングのためのセットアップを行う
   */
  setupRendering() {
    const gl = this.gl;
    // - ビューポート ---------------------------------------------------------
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    // クリアする色を設定する（RGBA で 0.0 ～ 1.0 の範囲で指定する）
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    // 実際にクリアする（gl.COLOR_BUFFER_BIT で色をクリアしろ、という指定になる）
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

    /**
   * GUI
   */
  setupGUI() {
    const gui = new GUI
    const guiParam = {}

    guiParam.toggleRender = () => {
      this.isRender = !this.isRender
      if (this.isRender) {
        this.start()
      }
    }

    gui.add(guiParam, 'toggleRender')
  }

  /**
   * 描画を開始する
   */
  start() {
    // レンダリングを行っているフラグを立てておく
    this.isRender = true;
    // レンダリングの開始
    this.render();
  }

  /**
   * 描画を停止する
   */
  stop() {
    this.isRender = false;
  }

  /**
   * レンダリングを行う
   */
  render() {
    const gl = this.gl;

    // レンダリングのフラグの状態を見て、requestAnimationFrame を呼ぶか決める
    if (this.isRender === true) {
      requestAnimationFrame(this.render);
    }
    // ビューポートの設定やクリア処理は毎フレーム呼び出す
    this.setupRendering();

    // 現在までの経過時間を計算し、秒単位に変換する
    this.currentTime = Date.now()
    this.delta = Math.max(0, Math.min(0.032, (this.currentTime - this.startTime) / 1000))
    this.elapsedTime += this.delta
    this.startTime = this.currentTime

    // プログラムオブジェクトを選択
    gl.useProgram(this.program);
    // ロケーションを指定して、uniform 変数の値を更新する（GPU に送る）
    gl.uniform1f(this.uniformLocation.time, this.elapsedTime);
    // ドローコール（描画命令）
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
                // https://developer.mozilla.org/ja/docs/Web/API/WebGLRenderingContext/drawArrays

    // // プログラムオブジェクトを選択
    // gl.useProgram(this.program_penta);
    // // ロケーションを指定して、uniform 変数の値を更新する（GPU に送る）
    // gl.uniform1f(this.uniformLocation_penta.time, this.elapsedTime);
    // // ドローコール（描画命令）
    // gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount_penta);
    //             // https://developer.mozilla.org/ja/docs/Web/API/WebGLRenderingContext/drawArrays
  }
}

