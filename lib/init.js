class Game {
    constructor(canvasElement) {
        this._canvas = document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
    }
    createScene() {
        this._scene = new BABYLON.Scene(this._engine);
        this._camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, 1.6, 7.6, new BABYLON.Vector3(0, 1.5, 0), this._scene);
        this._camera.minZ = 0.01;
        this._camera.allowUpsideDown = false;
        this._camera.wheelPrecision = 150;
        this._camera.attachControl(this._canvas, true);
        let hdrTexture = new BABYLON.CubeTexture("textures/Studio_Softbox_2Umbrellas_cube_specular.env", this._scene);
        hdrTexture.gammaSpace = false;
        this._scene.environmentTexture = hdrTexture;
        let shaderBall, shaderBallGLTFRoot;
        BABYLON.SceneLoader.ImportMesh("", "./models/cornell-box-original/", "scene.gltf", this._scene, function () {
        });
        let light0 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 2, 0), this._scene);
        light0.diffuse = new BABYLON.Color3(1, 0, 0);
        let lightSphere0 = BABYLON.Mesh.CreateSphere("Sphere0", 32, 0.3, this._scene);
        lightSphere0.position = light0.position;
        let material = new BABYLON.StandardMaterial("red", this._scene);
        material.diffuseColor = new BABYLON.Color3(0, 1, 0);
        material.specularColor = new BABYLON.Color3(0, 0, 0);
        material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        lightSphere0.material = material;
        let glowLayer = new BABYLON.GlowLayer("glow", this._scene, {
            mainTextureFixedSize: 256,
            blurKernelSize: 32
        });
        let time = 0;
        this._scene.registerBeforeRender(function () {
            time += 0.1;
        });
    }
    doRender() {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
        window.addEventListener("resize", () => {
            this._engine.resize();
        });
    }
}
window.addEventListener("DOMContentLoaded", () => {
    let game = new Game("renderCanvas");
    game.createScene();
    game.doRender();
});
//# sourceMappingURL=init.js.map