///<reference path="../babylon.d.ts" />

class Game {
  private _canvas: HTMLCanvasElement;
  private _engine: BABYLON.Engine;
  private _scene: BABYLON.Scene;
  private _camera: BABYLON.ArcRotateCamera;

  constructor(canvasElement: string) {
    this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
    this._engine = new BABYLON.Engine(this._canvas, true);
  }

  createScene(): void {
    this._scene = new BABYLON.Scene(this._engine);
    this._camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      1.6,
      7.6,
      new BABYLON.Vector3(0, 1.5, 0),
      this._scene
    );

    this._camera.minZ = 0.01;
    this._camera.allowUpsideDown = false;
    this._camera.wheelPrecision = 150;
    this._camera.attachControl(this._canvas, true);

    let hdrTexture = new BABYLON.CubeTexture("textures/Studio_Softbox_2Umbrellas_cube_specular.env", this._scene);
    hdrTexture.gammaSpace = false;
    this._scene.environmentTexture = hdrTexture;
    let shaderBall, shaderBallGLTFRoot;

    // Cornell box
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./models/cornell-box-original/",
      "scene.gltf",
      this._scene,
      function () {
        // this.scene.getMaterialByName("light.000").emissiveColor = BABYLON.Color3.White();
      }
    );

    let light0 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 2, 0), this._scene);
    light0.diffuse = new BABYLON.Color3(1, 0, 0);
    // light0.specular = new BABYLON.Color3(1, 0, 0);

    let lightSphere0 = BABYLON.Mesh.CreateSphere("Sphere0", 32, 0.3, this._scene);
    lightSphere0.position = light0.position;
    let material = new BABYLON.StandardMaterial("red", this._scene);
    material.diffuseColor = new BABYLON.Color3(0, 1, 0);
    material.specularColor = new BABYLON.Color3(0, 0, 0);
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    lightSphere0.material = material;

    // glow
    let glowLayer = new BABYLON.GlowLayer("glow", this._scene, {
      mainTextureFixedSize: 256,
      blurKernelSize: 32
    });

    // simple animation for the logo
    let time = 0; //this will be used as a time variable
    this._scene.registerBeforeRender(function() {
        time += 0.1;
    });

  }

  doRender(): void {
    // Run the render loop.
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });

    // The canvas/window resize event handler.
    window.addEventListener("resize", () => {
      this._engine.resize();
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Create the game using the 'renderCanvas'.
  let game = new Game("renderCanvas");

  // Create the scene.
  game.createScene();

  // Start render loop.
  game.doRender();
});
