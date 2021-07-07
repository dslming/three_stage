import * as THREE from 'three'

/**
 * 鼠标左键, 旋转控制
 */
export default class Rotation {
  constructor(param) {
    const { camera, dampingFactor, target, domWidth, domHeight, enableDamping } = param
    this.param = param

    this.spherical = new THREE.Spherical();
    this.sphericalDelta = new THREE.Spherical();

    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();

    this.rotateSpeed = 1.0
    this.quat = new THREE.Quaternion().setFromUnitVectors(this.param.camera.up, new THREE.Vector3(0, 1, 0));
    this.quatInverse = this.quat.clone().invert();
  }

  setRotateEnd(x, y) {
    this.rotateEnd.set(x, y)
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);
    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.param.domWidth);
    this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.param.domHeight);
    this.rotateStart.copy(this.rotateEnd);
    this.update()
  }

  setRotateStart(x, y) {
    this.rotateStart.set(x, y)
  }

  rotateLeft(angle) {
    this.sphericalDelta.theta -= angle;
  }

  rotateUp(angle) {
    this.sphericalDelta.phi -= angle;
  }

  update() {
    let { target, dampingFactor, camera, enableDamping } = this.param
    enableDamping = false
    const offset = new THREE.Vector3();
    var position = this.param.camera.position

    offset.copy(position).sub(target);
    // offset.applyQuaternion(this.quat);
    this.spherical.setFromVector3(offset);

    if (enableDamping) {
      this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
      this.spherical.phi += this.sphericalDelta.phi * dampingFactor;
    } else {
      this.spherical.theta += this.sphericalDelta.theta;
      this.spherical.phi += this.sphericalDelta.phi;
    }

    offset.setFromSpherical(this.spherical);
    // offset.applyQuaternion(this.quatInverse);

    position.copy(target).add(offset);
    camera.lookAt(target);

    if (enableDamping) {
      this.sphericalDelta.theta *= (1 - dampingFactor);
      this.sphericalDelta.phi *= (1 - dampingFactor);
    } else {
      this.sphericalDelta.set(0, 0, 0);
    }

  }
}
