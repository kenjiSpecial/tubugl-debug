precision highp float;

attribute vec4 position;

uniform vec2 uSize;
uniform vec2 uPosition;
uniform vec2 uWindow;

void main() {
    float xPos = (position.x/2. * uSize.x + uPosition.x)/uWindow.x * 2. - 1.0;
    float yPos = -(position.y/2. * uSize.y + uPosition.y)/uWindow.y * 2. + 1.0;
    gl_Position = vec4(xPos, yPos, 0.0, 1.0);
    // gl_Position = vec4(position.x, position.y, 0.0, 1.0);
}