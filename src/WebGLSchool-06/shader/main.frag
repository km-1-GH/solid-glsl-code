precision mediump float;

varying vec4 vColor;
varying vec3 vNewNormal;
varying vec2 vUv;
varying vec3 vPosition;

const float loopAngle = 1.0 / 6.0;

// カラー変換
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  // ライトベクトルはひとまず定数で定義する
  const vec3 light = vec3(0.5, 0.5, 1.0);

  // 変換した法線とライトベクトルで内積を取る @@@
  float d = dot(normalize(vNewNormal), normalize(light));
  d = d * 0.2 + 0.75; //0.75-1.0
  // 内積の結果を頂点カラーの RGB 成分に乗算する

  // color
  float hueAngle = floor(vUv.x / loopAngle);
  float hue = loopAngle * hueAngle;
  vec3 hsv = vec3(hue, 0.8, 0.8);
  vec3 newColor = vec3(hsv2rgb(hsv));
  // alpha 上下を切り落とす
  float alpha = 1.0 - step(0.98, vPosition.y);
  alpha *= step(0.1, vPosition.y + 1.0);


  gl_FragColor = vec4(newColor, alpha);
}

