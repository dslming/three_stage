import * as THREE from 'three'
import Rotation from './Rotation.js'
import Pan from './Pan.js'
import Dolly from './Dolly.js'
import { MOUSE, TOUCH, STATE } from './constants'

export default class MyOrbitControls {
  constructor(camera, domElement) {
    // 全局参数
    this.camera = camera
    this.domElement = domElement
    this.target = new THREE.Vector3(0, 0, 0)

    // 事件对应的处理动作
    this.mouseButtons = {
      LEFT: MOUSE.ROTATE,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.PAN
    };
    this.touches = {
      ONE: TOUCH.ROTATE,
      TWO: TOUCH.DOLLY_PAN
    };

    this.pan = new Pan({
      camera: this.camera,
      target: this.target,
      domWidth: this.domElement.width,
      domHeight: this.domElement.height,
    })

    this.dolly = new Dolly({
      camera: this.camera,
      target: this.target,
      domWidth: this.domElement.width,
      domHeight: this.domElement.height,
    })

    this.rotation = new Rotation({
      camera: this.camera,
      enableDamping: false,
      dampingFactor: 0.05,
      target: this.target,
      domWidth: this.domElement.width,
      domHeight: this.domElement.height,
    })

    // 鼠标参数
    this.state = STATE.NONE;

    this.onPointerDown = this.onPointerDown.bind(this)
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onWheel = this.onWheel.bind(this)

    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.initEvent()
  }


  initEvent() {
    // pc
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.ownerDocument.addEventListener('pointerup', this.onPointerUp);
    this.domElement.ownerDocument.addEventListener('pointermove', this.onPointerMove);
    this.domElement.addEventListener('contextmenu', this.onContextMenu);
    this.domElement.addEventListener('wheel', this.onWheel);

    // mobile
    this.domElement.addEventListener('touchstart', this.onTouchStart);
    this.domElement.addEventListener('touchend', this.onTouchEnd);
    this.domElement.addEventListener('touchmove', this.onTouchMove);
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.ownerDocument.removeEventListener('pointerup', this.onPointerUp);
    this.domElement.ownerDocument.removeEventListener('pointermove', this.onPointerMove);
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    this.domElement.removeEventListener('wheel', this.onWheel);
  }

  onWheel(event) {
    const { deltaY } = event
    this.dolly.handle(deltaY)
  }
  onContextMenu(event) {
    event.preventDefault();
  }
  onPointerMove(event) {
    if (this.state != "down") return
    const mouse = { x: event.clientX, y: event.clientY }

    switch (this.state) {
      case THREE.MOUSE.ROTATE:
        this.rotation.setRotateEnd(mouse.x, mouse.y)
        break;

      case THREE.MOUSE.PAN:
        this.pan.setPanEnd(mouse.x, mouse.y)
        break
    }
  }

  onPointerUp() {
    this.state = "up"
  }

  onPointerDown(event) {
    // 这里不处理touch事件
    const allowEvent = ["mouse", "pen"]
    if (!allowEvent.includes(event.pointerType)) {
      return
    }

    this.state = "down"

    event.preventDefault();
    let mouseAction = STATE.NONE
    switch (event.button) {
      case 0:
        mouseAction = this.mouseButtons.LEFT
        break;

      case 1:
        mouseAction = this.mouseButtons.MIDDLE;
      break;

      case 2:
        mouseAction = this.mouseButtons.RIGHT
        break;

      default:
        mouseAction = STATE.NONE;
    }

    const mouse = { x: event.clientX, y: event.clientY }
    switch (mouseAction) {
      case MOUSE.ROTATE:
        this.rotation.setRotateStart(mouse.x, mouse.y)
        break;

      case MOUSE.PAN:
        this.pan.setPanStart(mouse.x, mouse.y)
        break;

      default:
        break;
    }
  }

  handleTouchStartRotate(event) {
    if (event.touches.length == 1) {
      this.rotation.setRotateStart(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      this.rotation.setRotateStart(x, y);
    }
  }

  onTouchStart(event) {
    event.preventDefault(); // prevent scrolling
    switch (event.touches.length) {
      case 1:
        switch (this.touches.ONE) {
          case TOUCH.ROTATE:
            this.handleTouchStartRotate(event);
            this.state = STATE.TOUCH_ROTATE;
            break;
          case TOUCH.PAN:
            if (this.enablePan === false) return;
            this.handleTouchStartPan(event);
            this.state = STATE.TOUCH_DOLLY_PAN;
            break;

          default:
            this.state = STATE.NONE;
        }
        break;

      case 2:
        switch (this.touches.TWO) {
          case TOUCH.DOLLY_PAN:
            this.handleTouchStartDollyPan(event);
            break;

          case TOUCH.DOLLY_ROTATE:
            this.handleTouchStartDollyRotate(event);
            break;

          default:
        }

        break;

      default:
    }
  }

  onTouchEnd() {
    // no-op
  }

  handleTouchMoveRotate(event) {
    if (event.touches.length == 1) {
      this.rotation.setRotateEnd(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      this.rotation.setRotateEnd(x, y);
    }

    // rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
    // var element = scope.domElement;
    // rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height
    // rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
    // rotateStart.copy(rotateEnd);
  }

  onTouchMove(event) {
    event.preventDefault(); // prevent scrolling
    event.stopPropagation();

    	switch (this.state) {
    	  case STATE.TOUCH_ROTATE:
    	    if (this.enableRotate === false) return;
    	    this.handleTouchMoveRotate(event);
    	    this.update();
    	    break;

    	  case STATE.TOUCH_PAN:
    	    if (this.enablePan === false) return;
    	    handleTouchMovePan(event);
    	    this.update();
    	    break;

    	  case STATE.TOUCH_DOLLY_PAN:
    	    handleTouchMoveDollyPan(event);
    	    this.update();
    	    break;

    	  case STATE.TOUCH_DOLLY_ROTATE:
    	    handleTouchMoveDollyRotate(event);
    	    this.update();
    	    break;

    	  default:
    	    this.state = STATE.NONE;
    	}
  }

  update() {
    this.pan.update()
    this.dolly.update()
    this.rotation.update()
  }
}
