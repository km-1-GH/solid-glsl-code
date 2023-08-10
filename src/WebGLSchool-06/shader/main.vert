attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
attribute vec2 uv;

uniform mat4 mvpMatrix;
uniform mat4 normalMatrix; // 法線変換行列 @@@
uniform float uTime;

varying vec4 vColor;
varying vec3 vNewNormal;
varying vec2 vUv;
varying vec3 vPosition;

// ライトベクトルはひとまず定数で定義する
const vec3 light = vec3(1.0, 1.0, 1.0);
const float PI = 3.141592653589793;
const float loopAngle = 1.0 / 6.0;

// ランダムな数
float rand(float n)  { return fract(sin(n) * 43758.5453123); }

// map
float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  vec3 newPosition = position;

  // 法線をまず行列で変換する @@@
  vec3 newNormal = (normalMatrix * vec4(normal, 0.0)).xyz;

  // ふくらみを作る(60°ごと）
  float modulo = mod(uv.x, loopAngle) * (1.0 / loopAngle);
  float moduloDistance = 1.0 - (distance(modulo, 0.5) * 2.0);
  float yDistance = 1.0 - (distance(uv.y, 0.5) * 2.0);
  moduloDistance *= yDistance;
  moduloDistance += 0.1;

  //張り具合:uTime0.8以上でパンパン, 0.4以下同じ
  float strength = smoothstep(0.4, 0.8, uTime) * 2.0 - 1.0; //0~0.4->0.8~1 : -1~1
  float inflate = moduloDistance * strength * 0.11;
  // 大きさXZ
  float scaleXZ = smoothstep(0.0, 0.8, distance(0.4, uTime) * 2.0) * 0.8 + 0.2; //0.2~1.0
  // しぼむ時の高さ補正:uTime=0.6以上無効
  float cap = (1.0 - smoothstep(0.0, 0.6, uTime)) * 1.8; //1.8-0
  float deflateY = map(position.y, -1.0, 1.0, 0.0, cap);
  // しぼむ時の横シフト:uTime=0.2以上無効, uv=0.75以下で
  float shift = (1.0 - smoothstep(0.0, 0.2, uTime)) * smoothstep(0.25, 1.0, (1.0 - uv.y)) * 0.5;

  // シワ:uTime=0.6以上無効
  float random = rand(position.x * position.y) * (1.0 - smoothstep(0.2, 0.6, uTime)) * 0.04 * -1.0;

  // ふくらむ
  newPosition += normal * inflate;
  newPosition.x *= scaleXZ + newPosition.x * random;
  newPosition.x += shift;
  newPosition.z *= scaleXZ + newPosition.z * random;
  // しぼむ
  newPosition.y = position.y - deflateY + random;

  // varying
  vNewNormal = newNormal;
  vUv = uv;
  vPosition = position;
  vColor = color;

  // MVP 行列と頂点座標を乗算してから出力する
  gl_Position = mvpMatrix * vec4(newPosition, 1.0);
  
}

