// モジュールを読み込み
import { WebGLUtility } from './webglUtility.js';
import * as star from './star.js'
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
    /**
     * uniform 変数のロケーションを保持するオブジェクト
     * @type {object.<WebGLUniformLocation>}
     */
    this.uniformLocation = null;
    /**
     * 頂点の座標を格納する配列
     * @type {Array.<number>}
     */
    this.position = null;
    /**
     * 頂点の座標を構成する要素数（ストライド）
     * @type {number}
     */
    this.positionStride = null;
    /**
     * 座標の頂点バッファ
     * @type {WebGLBuffer}
     */
    this.positionVBO = null;
    /**
     * 頂点の色を格納する配列
     * @type {Array.<number>}
     */
    this.color = null;
    /**
     * 頂点の色を構成する要素数（ストライド）
     * @type {number}
     */
    this.colorStride = null;
    /**
     * 色の頂点バッファ
     * @type {WebGLBuffer}
     */
    this.colorVBO = null;
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
      // 変数に WebGL コンテキストを代入しておく（コード記述の最適化）
      const gl = this.gl;
      // WebGL コンテキストがあるかどうか確認する
      if (gl == null) {
        // もし WebGL コンテキストがない場合はエラーとして Promise を reject する
        const error = new Error('not initialized');
        reject(error);
      } else {
        const starVert = WebGLUtility.createShaderObject(gl, star.vs, gl.VERTEX_SHADER);

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
          // - プログラムオブジェクト -----------------------------------------
          // WebGL では、シェーダのソースコードから「シェーダオブジェクト」を生
          // 成しますが、このシェーダオブジェクトをリンクして、１つの整合性のあ
          // る「シェーダプログラム」にしてやる必要があります。
          // この「シェーダプログラム」のことを WebGL では「プログラムオブジェク
          // ト」と呼びます。
          // 今の段階では、とりあえずプログラムオブジェクトは１つです。
          // 将来的には、複数のプログラムオブジェクトを取り替えながら、複数のシ
          // ェーダプログラムを同時に走らせたりといったことも行います。
          // ------------------------------------------------------------------
        this.program = WebGLUtility.createProgramObject(gl, starVert, starFrag);

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

        // Promise を解決
        resolve();
      }
    });
  }

  /**
   * 頂点属性（頂点ジオメトリ）のセットアップを行う
   */
  setupGeometry() {
  // position
    this.positionStride = 3;
    this.vertexCount = star.positions.length / this.positionStride
    // VBO を生成
    this.positionVBO = WebGLUtility.createVBO(this.gl, star.positions);

                // static createVBO(gl, vertexArray) {
                //   // 空のバッファオブジェクトを生成する
                //   const vbo = gl.createBuffer();
                //   // バッファを gl.ARRAY_BUFFER としてバインドする
                //   gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
                //   // バインドしたバッファに Float32Array オブジェクトに変換した配列を設定する
                //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);
                //   // 安全のために最後にバインドを解除してからバッファオブジェクトを返す
                //   gl.bindBuffer(gl.ARRAY_BUFFER, null);
                //   return vbo;
                // }


  // color
    this.colorStride = 4;
    // VBO を生成
    this.colorVBO = WebGLUtility.createVBO(this.gl, star.colors);
  }

  /**
   * 頂点属性のロケーションに関するセットアップを行う
   */
  setupLocation() {
    const gl = this.gl;
    // - ロケーション ---------------------------------------------------------
    // GPU 上で動作するプログラム（つまりシェーダ）に、正しくデータを渡してやる
    // ために、あらかじめ「ロケーション」と呼ばれる情報を取得しておく必要があり
    // ます。
    // GPU 上の「参照先」や「ポインタのようなもの」と考えるとわかりやすいでしょ
    // うか…… どこに、どの頂点属性のデータを送り込めばいいのかを関連付けしてお
    // く作業です。
    // ロケーションは「シェーダプログラム側の変数名」を指定することで取得するこ
    // とができます。
    // ------------------------------------------------------------------------
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
  }

  /**
   * レンダリングのためのセットアップを行う
   */
  setupRendering() {
    const gl = this.gl;
    // - ビューポート ---------------------------------------------------------
    // WebGL で描画を行う領域のことをビューポートと呼びます。
    // 紛らわしいのは「canvas 要素の大きさ ＝ WebGL のビューポート」ではないとい
    // うことです。
    // どういうことかというと、canvas 要素というのは HTML エレメントの一種なので、
    // 当然ですが CSS で変形させることができます。つまり、canvas の見た目上の大
    // きさは、必ずしもレンダリングする広さと１対１の関係ではないのです。
    // ですから、WebGL 側ではどのような大きさのビューポートを利用したいのか別途
    // 指定しておかなくてはなりません。
    // ------------------------------------------------------------------------
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
    this.delta = Math.max(0, Math.min(0.32, this.currentTime - this.startTime))
    this.elapsedTime += this.delta


    // プログラムオブジェクトを選択
    gl.useProgram(this.program);
    // ロケーションを指定して、uniform 変数の値を更新する（GPU に送る）
    gl.uniform1f(this.uniformLocation.time, this.elapsedTime * 0.1);
    // ドローコール（描画命令）
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
                // https://developer.mozilla.org/ja/docs/Web/API/WebGLRenderingContext/drawArrays
  }
}

