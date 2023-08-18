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

const float PI = 3.141592653589793;
const float loopAngle = 1.0 / 12.0;

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

  // ふくらみを作る(30°ごと）
  float modulo = mod(uv.x, loopAngle) / loopAngle;
  float inflate = sin(modulo * PI);
  float distanceY = cos(position.y * 0.46 * PI);
  inflate = inflate * distanceY + 0.1;

  // 下をすぼめる
  float pullY = pow(1.0 - smoothstep(0.0, 1.0, distance(position.y, -1.0)), 10.0) * 0.2;

  //張り具合:uTime0.8以上でパンパン, 0.6以下同じ
  float strength = smoothstep(0.6, 0.8, uTime) * 2.0 - 1.0; //0~0.4->0.8~1 : -1~1
  inflate *= strength * 0.12;
  
  // 大きさXZ
  float scaleXZ = smoothstep(0.0, 0.9, uTime) * 0.8 + 0.2; //0.2~1.0

  // しぼむ時の横シフト:uTime=0.4以下で
  float shiftTime = (1.0 - smoothstep(0.0, 0.4, uTime)) * 1.8; //uTime=0=1,uTime=0.4=0
  float shiftXZ = min(shiftTime, distance(position.y, -1.0));

  // シワ:uTime=0.6以上無効
  float random = rand(position.x * position.y) * (1.0 - smoothstep(0.2, 0.6, uTime)) * 0.04 * -1.0;

  // vertex position update
  newPosition += normal * inflate;
  newPosition.x = (newPosition.x * scaleXZ - newPosition.x * random) + (shiftXZ * 0.5);
  newPosition.z = (newPosition.z * scaleXZ - newPosition.z * random) + (shiftXZ * 0.5);
  newPosition.y = position.y - pullY - (shiftXZ + (position.x * shiftXZ * 0.1) + (position.z * shiftXZ * 0.2) + random * 0.5);

  // varying
  vNewNormal = newNormal;
  vUv = uv;
  vPosition = position;
  vColor = color;

  // MVP 行列と頂点座標を乗算してから出力する
  gl_Position = mvpMatrix * vec4(newPosition, 1.0);
  
}

