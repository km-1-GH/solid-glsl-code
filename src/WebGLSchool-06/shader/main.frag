precision mediump float;

uniform sampler2D colorTexUnit; // テクスチャ @@@

varying vec4 vColor;
varying vec3 vNewNormal;
varying vec2 vUv; // テクスチャ座標 @@@
varying vec3 vLocalPosition;
varying vec3 vWorldPosition;

const float loopAngle = 1.0 / 12.0;

// カラー変換
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  // ライトベクトルはひとまず定数で定義する
  // vec3 light = vec3(0.5, 1.0, 0.0); //directional light
  vec3 lightPosition = vec3(1.0, 1.0, 3.0);
  vec3 light = lightPosition - vLocalPosition; //point light

  // 変換した法線とライトベクトルで内積を取る @@@
  float d = dot(normalize(vNewNormal), normalize(light)); //-1.0~1.0
  d = (d + 1.0) / 2.0 * 0.8 + 0.3;  //0.3~1.1

  // color(original)
  // float hueAngle = floor(vUv.x / loopAngle);
  // float hue = loopAngle * hueAngle;
  // vec3 hsv = vec3(hue, 0.8, 0.8);
  // vec3 newColor = vec3(hsv2rgb(hsv));

  // color(texture)
  vec3 newColor = texture2D(colorTexUnit, vUv).rgb;

  // alpha 上下を切り落とす
  float alpha = 1.0 - step(0.99, vLocalPosition.y);
  alpha *= step(0.06, vLocalPosition.y + 1.0);

  gl_FragColor = vec4(newColor * d, alpha);
}

