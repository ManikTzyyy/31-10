
import * as THREE from "three";

export function createFlame() {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },

    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float hValue;

      float random(vec2 st) {
        return fract(
          sin(dot(st, vec2(12.9898, 78.233)))
          * 43758.5453123
        );
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(a, b, u.x)
          + (c - a) * u.y * (1.0 - u.x)
          + (d - b) * u.x * u.y;
      }

      void main() {
        vUv = uv;
        vec3 pos = position;

        pos *= vec3(0.8, 2.0, 0.725);
        hValue = position.y;

        float lenXZ = length(position.xz);

        pos.y *= 1.0 + (
          cos((lenXZ + 0.25) * 3.1415926) * 0.25
          + noise(vec2(0.0, time)) * 0.125
          + noise(vec2(position.x + time, position.z + time)) * 0.5
        ) * position.y;

        pos.x += noise(
          vec2(time * 2.0, (position.y - time) * 4.0)
        ) * hValue * 0.0312;

        pos.z += noise(
          vec2((position.y - time) * 4.0, time * 2.0)
        ) * hValue * 0.0312;

        gl_Position = projectionMatrix
          * modelViewMatrix
          * vec4(pos, 1.0);
      }
    `,

    fragmentShader: `
      varying float hValue;
      varying vec2 vUv;

      vec3 heatmapGradient(float t) {
        return clamp(
          (pow(t, 1.5) * 0.8 + 0.2)
          * vec3(
            smoothstep(0.0, 0.35, t) + t * 0.5,
            smoothstep(0.5, 1.0, t),
            max(1.0 - t * 1.7, t * 7.0 - 6.0)
          ),
          0.0,
          1.0
        );
      }

      void main() {
        float v = abs(smoothstep(0.0, 0.4, hValue) - 1.0);

        float alpha = (1.0 - v) * 0.99;
        alpha -= 1.0 - smoothstep(1.0, 0.97, hValue);

        vec3 color = heatmapGradient(
          smoothstep(0.0, 0.3, hValue)
        ) * vec3(0.95, 0.95, 0.4);

        color = mix(
          vec3(0.0, 0.0, 1.0),
          color,
          smoothstep(0.0, 0.3, hValue)
        );

        color += vec3(1.0, 0.9, 0.5) * (1.25 - vUv.y);

        color = mix(
          color,
          vec3(0.66, 0.32, 0.03),
          smoothstep(0.95, 1.0, hValue)
        );

        gl_FragColor = vec4(color, alpha);
      }
    `,

    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);

  return {
    mesh,
    update(time) {
      material.uniforms.time.value = time;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}