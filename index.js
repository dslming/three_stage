import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module.js'

export default class Stage {
  constructor(container) {
    this.fuArr = []
    this.viceCamera = null
    this.tmpTarget = new THREE.Vector3()
    this.orbitControls = null
    this.cameraHelper = null
    this.container = container;
    this.initFlag = false;
    // 场景
    this.scene = new THREE.Scene();
    this.scene.name = "moumade";
    window.scene = this.scene;

    // 环境光
    var ambient = new THREE.AmbientLight(0xffffff, 0.5);
    ambient.name = "ambient";
    this.scene.add(ambient);

    let dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(100,100,100);
    dirLight.name = "dirLight";
    this.scene.add(dirLight);

    // 渲染器
    this.containerEle = document.querySelector(container);
    let vW = this.containerEle.clientWidth;
    let vH = this.containerEle.clientHeight;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      // alpha: false,
      // preserveDrawingBuffer: true,
      // failIfMajorPerformanceCaveat: true,
    });
    this.renderer.setClearColor(0x33334c, 1.0);
    // this.renderer.autoClear = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(vW, vH, false);
    this.containerEle.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000)

    this.camera.lookAt(0, 0, 0)
    this.camera.name = "camera";
    this.scene.add(this.camera);
    this.handleResize = this.handleResize.bind(this)
    this._loop = this._loop.bind(this)
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    this.initControls();
    this.camera.position.set(0, 0, 50)

    let axis = new THREE.AxesHelper(10000);
    this.scene.add(axis);

    this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.left = '0px';
		this.stats.domElement.style.top = '0px';
		this.stats.domElement.style.width = '100px';
		this.stats.domElement.id = 'stats';
		this.containerEle.appendChild(this.stats.dom);
  }

  initControls() {
    let control = new OrbitControls(this.camera, this.renderer.domElement);
    this.control = control
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    control.enableDamping = true;
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    control.dampingFactor = 0.35;
    //是否可以缩放
    control.enableZoom = true;
    control.zoomSpeed = 0.35;
    //是否自动旋转
    control.autoRotate = false;
    //设置相机距离原点的最远距离
    // control.minDistance = 22; //1000
    //设置相机距离原点的最远距离
    // control.maxDistance = 50; //3000
    //是否开启右键拖拽
    // control.enablePan = false;
  }

  handleResize() {
    // 获取新的大小
    let vpW = this.containerEle.clientWidth;
    let vpH = this.containerEle.clientHeight;
    // 设置场景
    this.renderer.domElement.width = vpW;
    this.renderer.domElement.height = vpH;
    this.renderer.setSize(this.containerEle.clientWidth, this.containerEle.clientHeight);
    // 设置相机
    this.camera.aspect = vpW / vpH;
    this.camera.updateProjectionMatrix();
  }


  run() {
    this._loop()
  }

  addViceCamera(viceCamera) {
    this.viceCamera = viceCamera
  }
  onUpdate(fu) {
    this.fuArr.push(fu)
  }

  _loop() {
    this.stats.update()
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld()
    this.renderer.render(this.scene, this.camera);

    this.fuArr.forEach(fun => {
      fun()
    });
    this.control && this.control.update()
    requestAnimationFrame(this._loop)
  }
}

