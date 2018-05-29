import { Program, ArrayBuffer, IndexArrayBuffer, } from 'tubugl-core';
import vertexShrderSrc from './shaders/camera.vert.glsl';
import fragmentShaderSrc from './shaders/camera.frag.glsl';
import axisVertexShaderSrc from './shaders/axis.frag.glsl';
import planeVertexShaderSrc from './shaders/plane.vert.glsl';
import planeFragmentShaderSrc from './shaders/plane.frag.glsl';

import { mat4 } from 'gl-matrix';
import { CameraController, PerspectiveCamera } from 'tubugl-camera';
import { GridHelper2 } from 'tubugl-helper';

export class CameraDebugger {
    /**
     * 
     * @param {Camera} camera 
     */
    constructor(gl, camera, width, height, color = [1, 1, 1]) {
        this._gl = gl;
        this._camera = camera;
        this._cameraModelMatrx = mat4.create();
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

    _makeProgram() {
        this._program = new Program(this._gl, vertexShrderSrc, fragmentShaderSrc);
    }

    _makeBuffers() {
        let positionArr = [];
        let fNear = this._camera.near * Math.tan(this._camera.fov / 180 / 2 * Math.PI);
        let fFar = this._camera.far * Math.tan(this._camera.fov / 180 / 2 * Math.PI);
        let aspect = this._camera.width / this._camera.height;
        positionArr.push( 0, 0, 0);
        positionArr.push( 0 + fNear * aspect,  fNear, - this._camera.near);
        positionArr.push( 0 + fNear * aspect,  -fNear, - this._camera.near);
        positionArr.push( 0 + fNear * -aspect,  -fNear, - this._camera.near);
        positionArr.push( 0 + fNear * -aspect,  fNear, - this._camera.near);
        positionArr.push( 0 + fFar * aspect,  fFar, - this._camera.far);
        positionArr.push( 0 + fFar * aspect,  -fFar, - this._camera.far);
        positionArr.push( 0 + fFar * -aspect,  -fFar, - this._camera.far);
        positionArr.push( 0 + fFar * -aspect,  fFar, - this._camera.far);

        this._positionBuffer = new ArrayBuffer(this._gl, new Float32Array(positionArr));
        this._positionBuffer.setAttribs('position', 3);

        let indexArray = [
            0, 1, 0, 2, 0, 3, 0, 4, 1, 2, 2, 3, 3, 4, 4, 1, 
            1, 5, 2, 6, 3, 7, 4, 8, 5, 6, 6, 7, 7, 8, 8, 5
        ];
        
        this._indexBuffer = new IndexArrayBuffer(this._gl, new Uint16Array(indexArray));
        this._cnt = indexArray.length;
    }
    
    _makeDebugCamera(){
        this._debugCamera = new PerspectiveCamera(this._width, this._height, 60, 1, 100000);
        this._debugCamera.position.z = -5000;
        this._debugCamera.position.y = 2000;
		this._debugCamera.lookAt([0, 0, 0]); 
    }
    
    _makeDebugCameraController(){
        this._cameraController = new CameraController(this._debugCamera, this._gl.canvas);
        this._cameraController.minDistance = 300;
		this._cameraController.maxDistance = 10000;
    }
    
    _makeGridHelper(){
        this._gridHelper = new GridHelper2(this._gl, {}, 2000, 2000, 20, 20);
    }
    
    _updateCamera() {
        mat4.copy(this._cameraModelMatrx, this._camera.rotation.matrix);
		this._cameraModelMatrx[12] = this._camera.position.array[0];
		this._cameraModelMatrx[13] = this._camera.position.array[1];
		this._cameraModelMatrx[14] = this._camera.position.array[2];
    }

    _updateAtributes() {
        this._positionBuffer.bind().attribPointer(this._program);
        this._indexBuffer.bind();
    }

    render(objArr) {
        
        this._updateCamera();
        this.update(this._debugCamera);
        this.draw();
        this._gridHelper.render(this._debugCamera);
        this._updateAxis(this._debugCamera)
			._drawAxis(-this._gridHelper._width / 2, -this._gridHelper._height / 2)
			._drawAxis(this._gridHelper._width / 2, this._gridHelper._height / 2);
        
        this._debugRender(objArr, this._debugCamera);
        
    }
    update(camera) {
        this._program.use();
        this._updateAtributes();

        this._gl.uniformMatrix4fv(
            this._program.getUniforms('modelMatrix').location,
            false,
            this._cameraModelMatrx
        );

        this._gl.uniformMatrix4fv(
            this._program.getUniforms('viewMatrix').location,
            false,
            camera.viewMatrix
        );

        this._gl.uniformMatrix4fv(
            this._program.getUniforms('projectionMatrix').location,
            false,
            camera.projectionMatrix
        );
        
        this._gl.uniformMatrix4fv(
            this._program.getUniforms('projectionMatrix').location,
            false,
            camera.projectionMatrix
        );
        
        this._gl.uniform3f(
            this._program.getUniforms('uColor').location,
            this._color[0],
            this._color[1],
            this._color[2]
        );
    }
    updateBuffer(){
        let positionArr = [];
        let fNear = this._camera.near * Math.tan(this._camera.fov / 180 / 2 * Math.PI);
        let fFar = this._camera.far * Math.tan(this._camera.fov / 180 / 2 * Math.PI);
        let aspect = this._camera.width / this._camera.height;
        positionArr.push( 0, 0, 0);
        positionArr.push( 0 + fNear * aspect,  fNear, - this._camera.near);
        positionArr.push( 0 + fNear * aspect,  -fNear, - this._camera.near);
        positionArr.push( 0 + fNear * -aspect,  -fNear, - this._camera.near);
        positionArr.push( 0 + fNear * -aspect,  fNear, - this._camera.near);
        positionArr.push( 0 + fFar * aspect,  fFar, - this._camera.far);
        positionArr.push( 0 + fFar * aspect,  -fFar, - this._camera.far);
        positionArr.push( 0 + fFar * -aspect,  -fFar, - this._camera.far);
        positionArr.push( 0 + fFar * -aspect,  fFar, - this._camera.far);
        
        this._positionBuffer.bind().setData(new Float32Array(positionArr));
    }
    draw() {
        
        this._gl.disable(this._gl.CULL_FACE);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.blendFunc(this._gl.ONE, this._gl.ZERO);
        this._gl.disable(this._gl.BLEND);
        
        this._gl.drawElements(this._gl.LINES, this._cnt, this._gl.UNSIGNED_SHORT, 0);
    }
    _debugRender(objArr, debugCamera){
        
        objArr.forEach(obj=>{
            obj.render(debugCamera);
        });
    }
    
    _makeAxisProgram(params = {}) {
		this._axisProgram = new Program(this._gl, axisVertexShaderSrc, fragmentShaderSrc);
		this._axisRateBuffer = new ArrayBuffer(this._gl, new Float32Array([0, 1]));
		this._axisRateBuffer.setAttribs('rate', 1);
		this._axisCnt = 2;
		this._axisSize = params.axisSize ? params.axisSize : 150;
		this._axisModelMat = mat4.create();
    }
    
    _makePlaneProgram() {
        this._planeProgram = new Program(this._gl, planeVertexShaderSrc, planeFragmentShaderSrc);
        this._planePositionBuffer = new ArrayBuffer(this._gl, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]));
        this._planePositionBuffer.setAttribs('position', 2);
		this._planeCnt = 6;
    }
    
    _updateAxis(camera) {
		this._axisProgram.use();
		this._axisRateBuffer.bind().attribPointer(this._axisProgram);

		this._gl.uniformMatrix4fv(
			this._axisProgram.getUniforms('modelMatrix').location,
			false,
			this._axisModelMat
		);
		this._gl.uniformMatrix4fv(
			this._axisProgram.getUniforms('viewMatrix').location,
			false,
			camera.viewMatrix
		);
		this._gl.uniformMatrix4fv(
			this._axisProgram.getUniforms('projectionMatrix').location,
			false,
			camera.projectionMatrix
		);

		this._gl.uniform1f(this._axisProgram.getUniforms('uLength').location, this._axisSize);

		return this;
	}

	_drawAxis(posX = 0, posZ) {
		this._gl.uniform3f(
			this._axisProgram.getUniforms('uStartPosition').location,
			posX,
			2,
			posZ
		);

		[[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(arr => {
			this._gl.uniform3f(
				this._axisProgram.getUniforms('uDir').location,
				arr[0],
				arr[1],
				arr[2]
			);
			this._gl.uniform3f(
				this._axisProgram.getUniforms('uColor').location,
				arr[0],
				arr[1],
				arr[2]
			);
			this._gl.drawArrays(this._gl.LINES, 0, this._axisCnt);
		});

		return this;
    }
    
    
    drawPlane(x, y, width, height, windowWidth, windowHeight, color){
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
    
    resize(width, height){
        this._width = width;
        this._height = height;
        
        this._debugCamera.updateSize(this._width, this._height);
        
        this.updateBuffer();
    }
}