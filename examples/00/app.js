/**
 * make demo with rendering of plane(webgl)
 */

const dat = require('../vendors/dat.gui.min');
const TweenLite = require('gsap/TweenLite');
// const Stats = require('../vendor/stats.min');

import { ProceduralCube } from 'tubugl-3d-shape';
import { PerspectiveCamera } from 'tubugl-camera';
import { CameraDebugger } from '../../src/index';

export default class App {
    constructor(params = {}) {
        this._isMouseDown = false;
        this._isCameraDebug = true;
        this._width = params.width ? params.width : window.innerWidth;
        this._height = params.height ? params.height : window.innerHeight;

        this.canvas = document.createElement('canvas');
        this.gl = this.canvas.getContext('webgl');

        this._setClear();
        this._makeBox();
        this._makeCamera();
        this._makeCameraDebugger();

        this.resize(this._width, this._height);

        if (params.isDebug) {
            // this.stats = new Stats();
            // document.body.appendChild(this.stats.dom);
            this._addGui();
        }
    }

    animateIn() {
        this.isLoop = true;
        TweenLite.ticker.addEventListener('tick', this.loop, this);
    }

    loop() {
        if (this.stats) this.stats.update();
        if(!this._theta ) this._theta = 0;
        this._theta += 1/60;
        
        this._camera.position.x = 800 * Math.cos(this._theta);
        this._camera.position.z = 800 * Math.sin(this._theta);
        this._camera.position.y = 600;
        this._camera.lookAt([0, 0, 0]);

        let gl = this.gl;
        gl.viewport(0, 0, this._width, this._height);
        this.gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        if (this._isCameraDebug) {
            this._debugRender();
        } else {
            this._box.render(this._camera);
        }

    }

    _debugRender() {
        this._cameraDebugger.render([this._box]);

        let width = 300;
        let height = width * this._height / this._width;
        let margin = 20;
        let marginWhite = 1;
        
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

        this._cameraDebugger.drawPlane(
            this._width - width/2 - margin - marginWhite, 
            this._height - height/2 - margin - marginWhite, 
            width + marginWhite * 2, height + marginWhite * 2, this._width, this._height, [1, 1, 1]);
            
       this.gl.clear(this.gl.DEPTH_BUFFER_BIT); 
       this._cameraDebugger.drawPlane(
                this._width - width/2 - margin - marginWhite, 
                this._height - height/2 - margin - marginWhite, 
                width, height, this._width, this._height, [0, 0, 0]);
        
                
        this.gl.viewport(this._width - (width + marginWhite + margin), marginWhite + margin, width, height);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        this._box.render(this._camera);
                
    }

    animateOut() {
        TweenLite.ticker.removeEventListener('tick', this.loop, this);
    }

    mouseMoveHandler(mouse) {
        if (!this._isMouseDown) return;
        this._camera.theta += (mouse.x - this._prevMouse.x) * Math.PI * 2;
        this._camera.phi += (mouse.y - this._prevMouse.y) * -Math.PI * 2;

        this._prevMouse = mouse;
    }

    mouseDownHandler(mouse) {
        this._isMouseDown = true;
        this._prevMouse = mouse;
    }

    mouseupHandler() {
        this._isMouseDown = false;
    }

    onKeyDown(ev) {
        switch (ev.which) {
            case 27:
                this._playAndStop();
                break;
        }
    }

    _playAndStop() {
        this.isLoop = !this.isLoop;
        if (this.isLoop) {
            TweenLite.ticker.addEventListener('tick', this.loop, this);
            this.playAndStopGui.name('pause');
        } else {
            TweenLite.ticker.removeEventListener('tick', this.loop, this);
            this.playAndStopGui.name('play');
        }
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this.canvas.width = this._width;
        this.canvas.height = this._height;
        this.gl.viewport(0, 0, this._width, this._height);

        this._box.resize(this._width, this._height);
        this._camera.updateSize(this._width, this._height);
        
        if(this._cameraDebugger) this._cameraDebugger.resize(this._width, this._height);
    }

    destroy() {}
    _setClear() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
    }
    _makeBox() {
        this._box = new ProceduralCube(
            this.gl, {
                isWire: true
            },
            200,
            200,
            200,
            4,
            5,
            6
        );
        this._box.posTheta = 0;
        this._box.rotTheta = 0;
        this._box.position.y = 100;
    }

    _makeCamera() {
        this._camera = new PerspectiveCamera(window.innerWidth, window.innerHeight, 60, 500, 2000);
        this._camera.position.z = 800;
        this._camera.position.y = 600;
        this._camera.lookAt([0, 0, 0]);
    }

    _makeCameraDebugger() {
        this._cameraDebugger = new CameraDebugger(this.gl, this._camera, this._width, this._height, [1, 1, 0]);
    }

    _addGui() {
        this.gui = new dat.GUI();
        this.gui.add(this, '_isCameraDebug').name('cameraDebug');

        this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');
        
        this._debugCameraGui = this.gui.addFolder('cameraDebugger');
        
        this.gui.add(this._camera, '_fov', 0, 180).onChange((value=>{
            this._camera.updateMatrix();
            this._cameraDebugger.updateBuffer();
        }));
        
    }
}