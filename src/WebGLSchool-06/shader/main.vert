attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
attribute vec2 uv;
attribute vec3 addNor;

uniform mat4 mvpMatrix;
uniform mat4 normalMatrix; // 法線変換行列 @@@
uniform float uTime;
uniform sampler2D normalTexUnit; // テクスチャ @@@
uniform mat4 mMatrix;

varying vec4 vColor;
varying vec3 vNewNormal;
varying vec2 vUv; // テクスチャ座標受け渡し用 @@@
varying vec3 vLocalPosition;
varying vec3 vWorldPosition;

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

  // ふくらみを作る(30°ごと）
  float modulo = mod(uv.x, loopAngle) / loopAngle;  //0~1
  float inflate = sin(modulo * PI); //0~1~0
  float distanceY = cos(position.y * 0.46 * PI);
  inflate = inflate * distanceY + 0.1;

  // 下をすぼめる
  float taperedUV = 1.0 - min(1.0, uv.y * 2.0); //下端0.0~半分1.0 -> 下端1.0~半分0.0
  float taperedY = taperedUV * 0.4; //1.0~0.0 -> 下端0.4~半分0.0
  float taperedXZ = cos(taperedUV * 0.3 * PI); //下端？~半分1.0

  //張り具合:uTime0.8以上でパンパン, 0.6以下同じ
  float inflateStrength = smoothstep(0.6, 0.8, uTime) * 2.0 - 1.0; //0~0.4->0.8~1 : -1~1
  inflate *= inflateStrength * 0.11;
  
  // 大きさXZ
  float scaleXZ = smoothstep(0.0, 0.9, uTime) * 0.8 + 0.2; //0.2~1.0

  // しぼむ時の横シフト:uTime=0.4以下で
  float shiftTime = (1.0 - smoothstep(0.0, 0.4, uTime)) * 1.8; //uTime=0=1,uTime=0.4=0
  float shiftXZ = min(shiftTime, distance(position.y, -1.0));

  // vertex position update
  newPosition += normal * inflate;
  newPosition.x = newPosition.x * scaleXZ * taperedXZ + (shiftXZ * 0.5);
  newPosition.z = newPosition.z * scaleXZ * taperedXZ + (shiftXZ * 0.5);
  newPosition.y = position.y - taperedY - (shiftXZ + (position.x * shiftXZ * 0.1) + (position.z * shiftXZ * 0.2));

  // 法線
  vec3 axis = vec3(0.0, -1.0, 0.0);
  vec3 tangent = normalize(cross(normal, axis));
  vec3 bitangent = normalize(cross(normal, tangent));
  mat3 tbn = mat3(tangent, bitangent, normal);

  // パンパンの時
  vec3 inflateNormal = normalize(normal + normalize(addNor) * inflateStrength);

  // シワ:uTime=0.6以上無効
  float wrinkleStrength = 1.0 - smoothstep(0.2, 0.6, uTime);
  // テクスチャから、テクスチャ座標の位置の色を取り出して、ローカル座標系に変換 @@@
  vec3 pickedNormal = tbn * normalize(texture2D(normalTexUnit, uv) * 2.0 - 1.0).xyz;

  vec3 mixedNormal = mix(inflateNormal, pickedNormal, ((1.0 - uv.y) * wrinkleStrength));
  vec3 destNormal = mixedNormal;

  // 法線を行列で変換する
  vec3 newNormal = (normalMatrix * vec4(destNormal, 0.0)).xyz;

  // varying
  vNewNormal = newNormal;
  vUv = uv;
  vLocalPosition = position;
  vWorldPosition = (mMatrix * vec4(newPosition, 1.0)).xyz;
  vColor = color;

  // MVP 行列と頂点座標を乗算してから出力する
  gl_Position = mvpMatrix * vec4(newPosition, 1.0);
}

