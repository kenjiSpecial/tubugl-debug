'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tubuglCore = require('tubugl-core');
var glMatrix = require('gl-matrix');
var tubuglCamera = require('tubugl-camera');
var tubuglHelper = require('tubugl-helper');

var vertexShrderSrc = "precision highp float;\nattribute vec4 position;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat4 modelMatrix;\nvoid main() {\n    gl_Position = projectionMatrix * viewMatrix  * modelMatrix * position;\n}";

var fragmentShaderSrc = "precision highp float;\nuniform vec3 uColor;\nvoid main(){\n    gl_FragColor = vec4(uColor, 1.0);\n}";

var axisVertexShaderSrc = "attribute float rate;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat4 modelMatrix;\nuniform vec3 uStartPosition;\nuniform vec3 uDir;\nuniform float uLength;\nvoid main() {\n\tvec4 targetPos = vec4(uStartPosition + uDir * rate * uLength, 1.0);\n    gl_Position = projectionMatrix * viewMatrix * modelMatrix * targetPos;\n}";

var planeVertexShaderSrc = "precision highp float;\nattribute vec4 position;\nuniform vec2 uSize;\nuniform vec2 uPosition;\nuniform vec2 uWindow;\nvoid main() {\n    float xPos = (position.x/2. * uSize.x + uPosition.x)/uWindow.x * 2. - 1.0;\n    float yPos = -(position.y/2. * uSize.y + uPosition.y)/uWindow.y * 2. + 1.0;\n    gl_Position = vec4(xPos, yPos, 0.0, 1.0);\n}";

var planeFragmentShaderSrc = "precision highp float;\nuniform vec3 uColor;\nvoid main(){\n    gl_FragColor = vec4(uColor, 1.0);\n}";

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var CameraDebugger = function () {
    /**
     * 
     * @param {Camera} camera 
     */
    function CameraDebugger(gl, camera, width, height) {
        var color = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [1, 1, 1];
        classCallCheck(this, CameraDebugger);

        this._gl = gl;
        this._camera = camera;
        this._cameraModelMatrx = glMatrix.mat4.create();
        this._width = width;
        this._height = height;
        this._color = color; // line color white

        this.cameraType = this._camera.type;

        this._makeProgram();
        this._makeBuffers();

        this._makeAxisProgram();
        this._makePlaneProgram();

        this._makeDebugCamera();
        this._makeDebugCameraController();
        this._makeGridHelper();
    }

    createClass(CameraDebugger, [{
        key: '_makeProgram',
        value: function _makeProgram() {
            this._program = new tubuglCore.Program(this._gl, vertexShrderSrc, fragmentShaderSrc);
        }
    }, {
        key: '_makeBuffers',
        value: function _makeBuffers() {
            var positionArr = [];
            var fNear = this._camera.near * Math.tan(this._camera.fov / 180 / 2 * Math.PI);
            var fFar = this._camera.far * Math.tan(this._camera.fov / 180 / 2 * Math.PI);
            var aspect = this._camera.width / this._camera.height;
            positionArr.push(0, 0, 0);
            positionArr.push(0 + fNear * aspect, fNear, -this._camera.near);
            positionArr.push(0 + fNear * aspect, -fNear, -this._camera.near);
            positionArr.push(0 + fNear * -aspect, -fNear, -this._camera.near);
            positionArr.push(0 + fNear * -aspect, fNear, -this._camera.near);
            positionArr.push(0 + fFar * aspect, fFar, -this._camera.far);
            positionArr.push(0 + fFar * aspect, -fFar, -this._camera.far);
            positionArr.push(0 + fFar * -aspect, -fFar, -this._camera.far);
            positionArr.push(0 + fFar * -aspect, fFar, -this._camera.far);

            this._positionBuffer = new tubuglCore.ArrayBuffer(this._gl, new Float32Array(positionArr));
            this._positionBuffer.setAttribs('position', 3);

            var indexArray = [0, 1, 0, 2, 0, 3, 0, 4, 1, 2, 2, 3, 3, 4, 4, 1, 1, 5, 2, 6, 3, 7, 4, 8, 5, 6, 6, 7, 7, 8, 8, 5];

            this._indexBuffer = new tubuglCore.IndexArrayBuffer(this._gl, new Uint16Array(indexArray));
            this._cnt = indexArray.length;
        }
    }, {
        key: '_makeDebugCamera',
        value: function _makeDebugCamera() {
            this._debugCamera = new tubuglCamera.PerspectiveCamera(this._width, this._height, 60, 1, 100000);
            this._debugCamera.position.z = -5000;
            this._debugCamera.position.y = 2000;
            this._debugCamera.lookAt([0, 0, 0]);
        }
    }, {
        key: '_makeDebugCameraController',
        value: function _makeDebugCameraController() {
            this._cameraController = new tubuglCamera.CameraController(this._debugCamera, this._gl.canvas);
            this._cameraController.minDistance = 300;
            this._cameraController.maxDistance = 10000;
        }
    }, {
        key: '_makeGridHelper',
        value: function _makeGridHelper() {
            this._gridHelper = new tubuglHelper.GridHelper2(this._gl, {}, 2000, 2000, 20, 20);
        }
    }, {
        key: '_updateCamera',
        value: function _updateCamera() {
            glMatrix.mat4.copy(this._cameraModelMatrx, this._camera.rotation.matrix);
            this._cameraModelMatrx[12] = this._camera.position.array[0];
            this._cameraModelMatrx[13] = this._camera.position.array[1];
            this._cameraModelMatrx[14] = this._camera.position.array[2];
        }
    }, {
        key: '_updateAtributes',
        value: function _updateAtributes() {
            this._positionBuffer.bind().attribPointer(this._program);
            this._indexBuffer.bind();
        }
    }, {
        key: 'render',
        value: function render(objArr) {

            this._updateCamera();
            this.update(this._debugCamera);
            this.draw();
            this._gridHelper.render(this._debugCamera);
            this._updateAxis(this._debugCamera)._drawAxis(-this._gridHelper._width / 2, -this._gridHelper._height / 2)._drawAxis(this._gridHelper._width / 2, this._gridHelper._height / 2);

            this._debugRender(objArr, this._debugCamera);
        }
    }, {
        key: 'update',
        value: function update(camera) {
            this._program.use();
            this._updateAtributes();

            this._gl.uniformMatrix4fv(this._program.getUniforms('modelMatrix').location, false, this._cameraModelMatrx);

            this._gl.uniformMatrix4fv(this._program.getUniforms('viewMatrix').location, false, camera.viewMatrix);

            this._gl.uniformMatrix4fv(this._program.getUniforms('projectionMatrix').location, false, camera.projectionMatrix);

            this._gl.uniformMatrix4fv(this._program.getUniforms('projectionMatrix').location, false, camera.projectionMatrix);

            this._gl.uniform3f(this._program.getUniforms('uColor').location, this._color[0], this._color[1], this._color[2]);
        }
    }, {
        key: 'updateBuffer',
        value: function updateBuffer() {
            var positionArr = [];
            var fNear = this._camera.near * Math.tan(this._camera.fov / 180 / 2 * Math.PI);
            var fFar = this._camera.far * Math.tan(this._camera.fov / 180 / 2 * Math.PI);
            var aspect = this._camera.width / this._camera.height;
            positionArr.push(0, 0, 0);
            positionArr.push(0 + fNear * aspect, fNear, -this._camera.near);
            positionArr.push(0 + fNear * aspect, -fNear, -this._camera.near);
            positionArr.push(0 + fNear * -aspect, -fNear, -this._camera.near);
            positionArr.push(0 + fNear * -aspect, fNear, -this._camera.near);
            positionArr.push(0 + fFar * aspect, fFar, -this._camera.far);
            positionArr.push(0 + fFar * aspect, -fFar, -this._camera.far);
            positionArr.push(0 + fFar * -aspect, -fFar, -this._camera.far);
            positionArr.push(0 + fFar * -aspect, fFar, -this._camera.far);

            this._positionBuffer.bind().setData(new Float32Array(positionArr));
        }
    }, {
        key: 'draw',
        value: function draw() {

            this._gl.disable(this._gl.CULL_FACE);
            this._gl.enable(this._gl.DEPTH_TEST);
            this._gl.blendFunc(this._gl.ONE, this._gl.ZERO);
            this._gl.disable(this._gl.BLEND);

            this._gl.drawElements(this._gl.LINES, this._cnt, this._gl.UNSIGNED_SHORT, 0);
        }
    }, {
        key: '_debugRender',
        value: function _debugRender(objArr, debugCamera) {

            objArr.forEach(function (obj) {
                obj.render(debugCamera);
            });
        }
    }, {
        key: '_makeAxisProgram',
        value: function _makeAxisProgram() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this._axisProgram = new tubuglCore.Program(this._gl, axisVertexShaderSrc, fragmentShaderSrc);
            this._axisRateBuffer = new tubuglCore.ArrayBuffer(this._gl, new Float32Array([0, 1]));
            this._axisRateBuffer.setAttribs('rate', 1);
            this._axisCnt = 2;
            this._axisSize = params.axisSize ? params.axisSize : 150;
            this._axisModelMat = glMatrix.mat4.create();
        }
    }, {
        key: '_makePlaneProgram',
        value: function _makePlaneProgram() {
            this._planeProgram = new tubuglCore.Program(this._gl, planeVertexShaderSrc, planeFragmentShaderSrc);
            this._planePositionBuffer = new tubuglCore.ArrayBuffer(this._gl, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]));
            this._planePositionBuffer.setAttribs('position', 2);
            this._planeCnt = 6;
        }
    }, {
        key: '_updateAxis',
        value: function _updateAxis(camera) {
            this._axisProgram.use();
            this._axisRateBuffer.bind().attribPointer(this._axisProgram);

            this._gl.uniformMatrix4fv(this._axisProgram.getUniforms('modelMatrix').location, false, this._axisModelMat);
            this._gl.uniformMatrix4fv(this._axisProgram.getUniforms('viewMatrix').location, false, camera.viewMatrix);
            this._gl.uniformMatrix4fv(this._axisProgram.getUniforms('projectionMatrix').location, false, camera.projectionMatrix);

            this._gl.uniform1f(this._axisProgram.getUniforms('uLength').location, this._axisSize);

            return this;
        }
    }, {
        key: '_drawAxis',
        value: function _drawAxis() {
            var _this = this;

            var posX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var posZ = arguments[1];

            this._gl.uniform3f(this._axisProgram.getUniforms('uStartPosition').location, posX, 2, posZ);

            [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (arr) {
                _this._gl.uniform3f(_this._axisProgram.getUniforms('uDir').location, arr[0], arr[1], arr[2]);
                _this._gl.uniform3f(_this._axisProgram.getUniforms('uColor').location, arr[0], arr[1], arr[2]);
                _this._gl.drawArrays(_this._gl.LINES, 0, _this._axisCnt);
            });

            return this;
        }
    }, {
        key: 'drawPlane',
        value: function drawPlane(x, y, width, height, windowWidth, windowHeight, color) {
            this._planeProgram.use();

            this._planePositionBuffer.bind().attribPointer(this._planeProgram);

            this._gl.uniform2f(this._planeProgram.getUniforms('uPosition').location, x, y);
            this._gl.uniform2f(this._planeProgram.getUniforms('uSize').location, width, height);
            this._gl.uniform2f(this._planeProgram.getUniforms('uWindow').location, windowWidth, windowHeight);
            this._gl.uniform3f(this._planeProgram.getUniforms('uColor').location, color[0], color[1], color[2]);

            this._gl.disable(this._gl.CULL_FACE);
            this._gl.enable(this._gl.DEPTH_TEST);
            this._gl.blendFunc(this._gl.ONE, this._gl.ZERO);
            this._gl.disable(this._gl.BLEND);

            this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
        }
    }, {
        key: 'resize',
        value: function resize(width, height) {
            this._width = width;
            this._height = height;

            this._debugCamera.updateSize(this._width, this._height);

            this.updateBuffer();
        }
    }]);
    return CameraDebugger;
}();



var utils = /*#__PURE__*/Object.freeze({

});

exports.utils = utils;
exports.CameraDebugger = CameraDebugger;
