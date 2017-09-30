import * as Three from 'three';

const mapToEventListeners = ({ element, handler, useCapture }, ...events) => {
  events.forEach(event => element.addEventListener(event, handler, useCapture));
};

const panorama360 = ({ container, url }) => {
  let camera, scene, renderer;

  let isUserInteracting = false,
      isOnEnd = true,
      timeoutId = null,
      startCoords = { x: 0, y: 0},
      start = { lon: 0, lat: 0 },
      indent = { lon: 0, lat: 0 };

  const init = ({ container, url }) => {
    const map = new Three.TextureLoader().load(url);

    camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new Three.Vector3(0, 0, 0);

    scene = new Three.Scene();

    const geometry = new Three.SphereBufferGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const material = new Three.MeshBasicMaterial({ map });

    const mesh = new Three.Mesh(geometry, material);

    scene.add(mesh);

    renderer = new Three.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const coords = (event) => {
      return {
        x: event.clientX || event.touches[0].clientX,
        y: event.clientY || event.touches[0].clientY
      };
    };
    const turn = (event) => {
      const now = coords(event);
      return {
        lon: (startCoords.x - now.x) * 0.1 + start.lon,
        lat: (now.y - startCoords.y) * 0.1 + start.lat
      };
    };

    const handleStart = (event) => {
      // event.preventDefault();
      isOnEnd = false;
      if (timeoutId !== null) {
        clearInterval(timeoutId);
        timeoutId = null;
      }

      isUserInteracting = true;
      startCoords = coords(event);
      start = indent;
    };
    const handleMove = (event) => {
      if (!isOnEnd) {
        indent = turn(event);
      }
    };
    const handleEnd = (event) => {
      isOnEnd = true;
      timeoutId = setTimeout(function () {
        timeoutId = null;
        isUserInteracting = false;
      }, 5000);
    };

    const element = document;
    const useCapture = false;

    mapToEventListeners({
      element,
      useCapture,
      handler: handleStart
    }, 'mousedown', 'touchstart');
    mapToEventListeners({
      element,
      useCapture,
      handler: handleMove
    }, 'mousemove', 'touchmove');
    mapToEventListeners({
      element,
      useCapture,
      handler: handleEnd
    }, 'mouseup', 'touchend');

    document.addEventListener('wheel', (event) => {
      camera.fov += event.deltaY * 0.05;
      camera.updateProjectionMatrix();
    }, false);
    document.addEventListener('dragover', (event) => {
      event.preventDefault();

      event.dataTransfer.dropEffect = 'copy';
    }, false);
    document.addEventListener('dragenter', () => {
      document.body.style.opacity = 0.5;
    }, false);
    document.addEventListener('dragleave', () => {
      document.body.style.opacity = 1;
    }, false);
    document.addEventListener('drop', (event) => {
      event.preventDefault();

      const reader = new FileReader();
      reader.addEventListener('load', (event) => {
        material.map.image.src = event.target.result;
        material.map.needsUpdate = true;
      }, false);
      reader.readAsDataURL(event.dataTransfer.files[0]);

      document.body.style.opacity = 1;
    }, false);
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
  };

  const update = () => {
    if (!isUserInteracting) {
      indent.lon += 0.1;
    }
    indent.lat = Math.max(-85, Math.min(85, indent.lat));
    const phi = Three.Math.degToRad(90 - indent.lat);
    const theta = Three.Math.degToRad(indent.lon);

    camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 500 * Math.cos(phi);
    camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);

    renderer.render(scene, camera);
  };

  const animate = () => {
    requestAnimationFrame(animate);
    update();
  };

  init({
    container,
    url
  });
  animate();
};

export default panorama360;