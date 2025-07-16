/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, type FunctionComponent } from "react";
import * as THREE from "three";
const ObjectFrameFunctions: ((dt:number) => void)[] = [];
function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = mountRef.current;

    if (canvas == null) return;
    const renderer = new THREE.WebGLRenderer();
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 1000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.appendChild(renderer.domElement);

    const cube = new Player({
      geometry: new THREE.BoxGeometry(0.2, 0.2, 0.1),
      material: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    });
    renderer.domElement.addEventListener("click", (e) => {
      const coords = UnitHelper.hf_Get_Normalized_Coordinates({
        x: e.clientX,
        y: e.clientY,
      });
      cube.setTargetPosition(coords.x, coords.y);
    });
    scene.add(cube);

    camera.position.z = 10;

    // HER FRAME'DE ÇALIŞACAK FONKSİYON
    let lastTime = performance.now();
    const renderFrame = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      ObjectFrameFunctions.forEach((fn) => fn(dt)); // if using dt

      renderer.render(scene, camera);
      requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame);
  }, []);

  return (
    <div className="game-area">
      <div ref={mountRef} />
    </div>
  );
}

export default App;

class GameObject extends THREE.Mesh {
  velocity: THREE.Vector3 = new THREE.Vector3();
  constructor(props: {
    geometry: THREE.BoxGeometry;
    material: THREE.Material;
  }) {
    super(props.geometry, props.material);
    ObjectFrameFunctions.push(this.update.bind(this));
  }

  update(dt:number) {}
}

class Player extends GameObject {
  targetPosition = new THREE.Vector3(this.position.x, this.position.y, 0);

  update(dt:number) {
    if (this.position) this.position.lerp(this.targetPosition, 0.1);
  }

  public setTargetPosition = (x: number, y: number): void => {
    this.targetPosition.set(x, y, 0);
  };
}

class UnitHelper {
  static hf_Get_Normalized_Coordinates = (coords: { x: number; y: number }) => {
    const a = window.innerWidth / 2;
    const b = window.innerHeight / 2;
    return {
      x: (coords.x - a) * (2 / a),
      y: -(coords.y - b) * (2 / b),
    };
  };
}
