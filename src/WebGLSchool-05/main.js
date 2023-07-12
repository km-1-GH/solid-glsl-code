import App from './webglScript.js'
import './style.scss'

// ドキュメントの読み込みが完了したら実行されるようイベントを設定する
window.addEventListener('DOMContentLoaded', () => {
  // アプリケーションのインスタンスを初期化し、必要なリソースをロードする
  const app = new App();
  app.init();
              // init() {
              //   this.canvas = document.getElementById('webgl-canvas');
              //   this.gl = WebGLUtility.createWebGLContext(this.canvas);
              //   const size = Math.min(window.innerWidth, window.innerHeight);
              //   this.canvas.width  = size;
              //   this.canvas.height = size;
              // }

  app.load()
              // load() {
              //   return new Promise((resolve, reject) => {
              //     const gl = this.gl;
              //     if (gl == null) {
              //       const error = new Error('not initialized');
              //       reject(error);
              //     } else {
              //       let vs = null;
              //       let fs = null;
              //       WebGLUtility.loadFile('./shader/main.vert')
              //       .then((vertexShaderSource) => {
              //         vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
              //         return WebGLUtility.loadFile('./shader/main.frag');
              //       })
              //       .then((fragmentShaderSource) => {
              //         fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
              //         this.program = WebGLUtility.createProgramObject(gl, vs, fs);
              //         resolve();
              //       });
              //     }
              //   });
              // }
  .then(() => {
    // ジオメトリセットアップ
    app.setupGeometry();
              // setupGeometry() {
              //   this.position = [
              //      0.0,  0.5,  0.0, // ひとつ目の頂点の x, y, z 座標
              //      0.5, -0.5,  0.0, // ふたつ目の頂点の x, y, z 座標
              //     -0.5, -0.5,  0.0, // みっつ目の頂点の x, y, z 座標
              //   ];
              //   this.positionStride = 3;
              //   this.positionVBO = WebGLUtility.createVBO(this.gl, this.position);
            
              //   this.color = [
              //     1.0, 0.0, 0.0, 1.0, // ひとつ目の頂点の r, g, b, a カラー
              //     0.0, 1.0, 0.0, 1.0, // ふたつ目の頂点の r, g, b, a カラー
              //     0.0, 0.0, 1.0, 1.0, // みっつ目の頂点の r, g, b, a カラー
              //   ];
              //   this.colorStride = 4;
              //   this.colorVBO = WebGLUtility.createVBO(this.gl, this.color);
              // }

    // ロケーションのセットアップ
    app.setupLocation();
              // setupLocation() {
              //   const gl = this.gl;

              //   const attPosition = gl.getAttribLocation(this.program, 'position');
              //   const attColor = gl.getAttribLocation(this.program, 'color');

              //   WebGLUtility.enableAttribute(gl, this.positionVBO, attPosition, this.positionStride);
              //   WebGLUtility.enableAttribute(gl, this.colorVBO, attColor, this.colorStride);
              //   // uniform location の取得
              //   this.uniformLocation = {
              //     time: gl.getUniformLocation(this.program, 'time'),
              //   };
              // }
  
    // セットアップが完了したら描画を開始する
    app.setupGUI()
    app.start();
              // start() {
              //   this.startTime = Date.now();
              //   this.isRender = true;
              //   this.render();
              
                          // render() {
                          //   const gl = this.gl;

                          //   if (this.isRender === true) {
                          //     requestAnimationFrame(this.render);
                          //   }

                          //   this.setupRendering();

                                      //   setupRendering() {
                                      //     const gl = this.gl;
                                      //     gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                                      //     gl.clearColor(0.3, 0.3, 0.3, 1.0);
                                      //     gl.clear(gl.COLOR_BUFFER_BIT);
                                      //   }
                          

                          //   const nowTime = (Date.now() - this.startTime) * 0.001;
                          //   gl.useProgram(this.program);
                          //   gl.uniform1f(this.uniformLocation.time, nowTime);
                          //   gl.drawArrays(gl.TRIANGLES, 0, this.position.length / this.positionStride);
                          // }
            

              // }
  });
}, false);
