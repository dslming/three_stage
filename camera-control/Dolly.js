import * as THREE from 'three'

/**
 * 缩放控制
 */
export class Dolly {
  constructor(param) {
    this.param = param
    this.zoomSpeed = 1
    this.scale = 1

    this.dollyStart = new THREE.Vector2();
    this.dollyEnd = new THREE.Vector2();
  }

   setDollyStartForMobile(x, y) {
     this.dollyStart.set(x, y)
   }

  setDollyEndForMobile(x, y) {
    const dollyDelta = new THREE.Vector2();
     this.dollyEnd.set(x, y)
    dollyDelta.set(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed));
    this.dollyOut(dollyDelta.y);
    this.dollyStart.set(x,y)
   }

  handlePC(deltaY) {
    if (deltaY > 0) {
      this.dollyOut(this.getZoomScale())
    } else {
      this.dollyIn(this.getZoomScale())
    }
    this.update()
  }

  dollyOut(dollyScale) {
    this.scale /= dollyScale
  }
  dollyIn(dollyScale) {
    this.scale *= dollyScale
  }

  getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed);
  }

  update() {
    let { target } = this.param

    let spherical = new THREE.Spherical();
    const offset = new THREE.Vector3();
    var position = this.param.camera.position
    offset.copy(position).sub(target);
    spherical.setFromVector3(offset);
    spherical.radius *= this.scale
    this.scale = 1

    offset.setFromSpherical(spherical);
    position.copy(target).add(offset);
  }
}
