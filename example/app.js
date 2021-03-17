import Stage from '../index.js'
import * as THREE from 'three'
import * as dat from "dat.gui";

class Options {
  constructor() {
    this.message = 'dat.gui';
    this.speed = 0.01;
    this.displayOutline = false;
  }
};

class App {
  constructor() {
    this.settings = this.settings.bind(this)
    this.stage = new Stage("#app")
    this.stage.run()
    this.addBox(10)

    this.settings()
  }


  settings() {
    var options = new Options();
    var gui = new dat.GUI();

    gui.add(options, 'message');
    gui.add(options, 'speed', 0, 0.1);
    this.options = options
    window.lm = options
  }

  addBox(size) {
    var geometry = new THREE.BoxBufferGeometry(size, size, size);
    var material = new THREE.MeshPhongMaterial({
      color: 0x63e42a,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      shading: THREE.FlatShading
    })
    var cube = new THREE.Mesh(geometry, material);
    cube.name = "test_cube"
    this.stage.scene.add(cube)
    this.stage.onUpdate(() => {
      cube.rotation.x += this.options.speed || 0
      cube.rotation.y += this.options.speed || 0
    })
  }
}

window.onload = () => {
  let app = new App()
}
