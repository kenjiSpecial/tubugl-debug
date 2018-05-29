precision highp float;

attribute vec4 position;
// attribute vec3 color;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// varying vec3 vColor;

void main() {
    gl_Position = projectionMatrix * viewMatrix  * modelMatrix * position;
    // vColor = color;
}