import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import {fetchModelData, importModelLighting} from './home-models.js';

// Model 11 has platform/plinth faces exactly coincident with perimeter walls.
// Resolve their depth tie on runtime copies; keep all accepted vertices intact.
const MODEL11_RECESSED_SURFACES = new Set([
  'North_open_forecourt_raised_platform',
  'East_rear_outside_terrace',
  'Tapered_site_plinth',
]);

// The acceptance files remain the source of geometry and window selection.
// This adapter owns runtime copies only. It never recentres or deforms a model.
export async function loadModelScene(config, {signal, data, lightingModule = importModelLighting(config)} = {}) {
  const sourceURL = new URL(config.source, import.meta.url).href;
  const resources = { geometries: new Set(), materials: new Set(), textures: new Set() };
  let model, lighting, keyLight, disposed = false;

  function remember(root) {
    root?.traverse(object => {
      if (!object.isMesh) return;
      if (object.geometry) resources.geometries.add(object.geometry);
      for (const material of [].concat(object.material || [])) {
        resources.materials.add(material);
        for (const value of Object.values(material)) {
          if (value?.isTexture) resources.textures.add(value);
        }
      }
    });
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    remember(model);
    remember(lighting?.group);
    keyLight?.shadow.dispose();
    for (const texture of resources.textures) texture.dispose();
    for (const material of resources.materials) material.dispose();
    for (const geometry of resources.geometries) geometry.dispose();
    model?.removeFromParent();
    lighting?.group?.removeFromParent();
  }

  function checkAbort() {
    if (signal?.aborted) throw signal.reason ?? new DOMException('Model loading cancelled', 'AbortError');
  }
  // Dynamic imports cannot be cancelled, but a stalled module must not hold an
  // abandoned scene or prevent the current request from timing out.
  function waitForModule(promise) {
    if (!signal) return promise;
    return new Promise((resolve, reject) => {
      const abort = () => {
        signal.removeEventListener('abort', abort);
        reject(signal.reason ?? new DOMException('Model loading cancelled', 'AbortError'));
      };
      signal.addEventListener('abort', abort, {once:true});
      promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
      if (signal.aborted) abort();
    });
  }

  try {
    // Observe early rejection while the GLB fetch/parse is still in progress.
    lightingModule.catch(() => {});
    checkAbort();
    const buffer = await (data ?? fetchModelData(config, {signal}));
    checkAbort();
    const gltf = await new GLTFLoader().parseAsync(buffer, new URL('.', sourceURL).href);
    remember(gltf.scene);
    checkAbort();
    const { createWindowLighting, WINDOW_PANES, LIGHTING_DEFAULTS } = await waitForModule(lightingModule);
    checkAbort();
    if (LIGHTING_DEFAULTS.color !== '#ff9a45' || LIGHTING_DEFAULTS.brightness !== 1.2 ||
        WINDOW_PANES.size !== config.paneCount) {
      throw new Error(`Lighting acceptance mismatch: ${config.id}`);
    }

    // Match the accepted preview's pre-clone ordering for coplanar frame edges.
    const sourceOrder = new Map();
    gltf.scene.traverse(object => {
      if (object.isMesh) sourceOrder.set(object.name, {
        material: object.material.id,
        object: object.id,
      });
    });
    model = gltf.scene.clone(true);
    // Audit-only checksums: rendering never edits a vertex buffer.
    const geometryFingerprints = new Map();
    function fingerprint(geometry) {
      let hash = 2166136261;
      const attributes = [geometry.index, ...Object.keys(geometry.attributes).sort().map(name => geometry.attributes[name])];
      for (const attribute of attributes) {
        const array = attribute?.array ?? attribute?.data?.array;
        if (!array) continue;
        const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
        for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619) >>> 0;
      }
      return hash.toString(16).padStart(8, '0');
    }
    const sourceGeometry = [];
    model.traverse(object => {
      if (!object.isMesh) return;
      if (!geometryFingerprints.has(object.geometry)) {
        geometryFingerprints.set(object.geometry, fingerprint(object.geometry));
      }
      sourceGeometry.push({
        object,
        geometry: object.geometry,
        position: object.position.toArray(),
        quaternion: object.quaternion.toArray(),
        scale: object.scale.toArray(),
      });
    });
    lighting = createWindowLighting(model);
    // Preserve unlit glass; only blend its reflected base toward the reference
    // while the windows light up. The accepted lighting module stays unchanged.
    // The source lighting module leaves 6% reflected base colour at full light.
    const litPaneReflection = config.litPaneBaseColor ? new THREE.Color(config.litPaneBaseColor).multiplyScalar(.06) : null;
    const litPaneEmissive = config.litPaneEmissive ? new THREE.Color(config.litPaneEmissive) : null;
    const originalPaneColors = litPaneReflection ? lighting.panes.map(pane => pane.originalColor.clone()) : null;
    const depthPrioritySurfaces = [];
    if (config.id === 'model-11') {
      model.traverse(object => {
        if (!object.isMesh || !MODEL11_RECESSED_SURFACES.has(object.name)) return;
        object.material = object.material.clone();
        object.material.polygonOffset = true;
        object.material.polygonOffsetFactor = 1;
        object.material.polygonOffsetUnits = 1;
        depthPrioritySurfaces.push(object.name);
      });
      if (depthPrioritySurfaces.length !== MODEL11_RECESSED_SURFACES.size) {
        throw new Error('Model 11 depth-priority surface mismatch');
      }
    }
    remember(model);
    remember(lighting.group);
    if (lighting.panes.length !== config.paneCount) {
      throw new Error(`Window pane count mismatch: ${config.id}`);
    }
    const foundWindows = new Set(lighting.panes.map(({ mesh }) => mesh.name));
    if (foundWindows.size !== WINDOW_PANES.size ||
        [...WINDOW_PANES].some(name => !foundWindows.has(name))) {
      throw new Error(`Window whitelist mismatch: ${config.id}`);
    }

    const scene = new THREE.Scene();
    // Transparent canvas allows the existing stone background to remain visible.
    scene.background = null;
    scene.add(model);
    model.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = !object.material.transparent;
      object.receiveShadow = config.receiveTransparentShadow || !object.material.transparent;
    });
    // These accepted effect surfaces stay separate from the source model and
    // retain castShadow=false / receiveShadow=false. Both roots rotate together.
    if (lighting.group) scene.add(lighting.group);

    const h = config.framingWidth;
    const camera = new THREE.OrthographicCamera(-h / 2, h / 2, h / 2, -h / 2, .1, 100);
    const target = new THREE.Vector3(...config.target);
    camera.position.copy(target).add(new THREE.Vector3(10, 10, 10));
    camera.lookAt(target);
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    keyLight = new THREE.DirectionalLight(0xffffff, 2.22);
    keyLight.position.set(-.15, 4, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.radius = 3;
    Object.assign(keyLight.shadow.camera, {
      left: -5, right: 5, top: 6, bottom: -5, near: .5, far: 30,
    });
    keyLight.shadow.bias = -.0002;
    keyLight.shadow.normalBias = .015;
    scene.add(keyLight);

    function configureRenderer(renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.setClearColor(0xffffff, 0);
      renderer.setOpaqueSort(config.sourceOrder ? (a, b) => {
        const x = sourceOrder.get(a.object.name), y = sourceOrder.get(b.object.name);
        return a.groupOrder - b.groupOrder || a.renderOrder - b.renderOrder ||
          (x?.material ?? a.material.id) - (y?.material ?? b.material.id) ||
          a.z - b.z || (x?.object ?? a.id) - (y?.object ?? b.id);
      } : null);
    }

    function resize(width, height) {
      if (!(width > 0 && height > 0)) return;
      camera.left = -h / 2;
      camera.right = h / 2;
      camera.top = h * height / width / 2;
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
    }

    const initialAngle = config.initialAngle ?? 0;
    let angle = 0, amount = 0;
    function setAngle(next) {
      if (!Number.isFinite(next)) throw new Error('Model angle must be finite');
      angle = next;
      model.rotation.y = initialAngle + angle;
      if (lighting.group) lighting.group.rotation.y = model.rotation.y;
    }
    function setLight(next) {
      if (!Number.isFinite(next)) throw new Error('Light amount must be finite');
      amount = Math.min(1, Math.max(0, next));
      lighting.apply(amount, 1.2);
      if (litPaneReflection) {
        lighting.panes.forEach((pane, index) => pane.mesh.material.color.copy(originalPaneColors[index]).lerp(litPaneReflection, amount));
      }
      if (litPaneEmissive && amount > 0) {
        lighting.panes.forEach(pane => pane.mesh.material.emissive.copy(litPaneEmissive));
      }
    }

    function audit() {
      const meshes = [];
      const capture = (root, effect = false) => root?.traverse(object => {
        if (!object.isMesh) return;
        meshes.push({
          name: object.name,
          lit: WINDOW_PANES.has(object.name),
          effect,
          visible: object.visible && root.visible,
          emissive: object.material.emissive?.getHexString() ?? null,
          intensity: object.material.emissiveIntensity ?? null,
          opacity: object.material.opacity,
          geometry: object.geometry.uuid,
          vertices: object.geometry.attributes.position?.count ?? 0,
          triangles: (object.geometry.index?.count ?? object.geometry.attributes.position?.count ?? 0) / 3,
          position: object.position.toArray(),
          scale: object.scale.toArray(),
          castShadow: object.castShadow,
          receiveShadow: object.receiveShadow,
        });
      });
      capture(model);
      capture(lighting.group, true);
      const unchanged = sourceGeometry.every(before => {
        const object = before.object;
        return object.geometry === before.geometry &&
          object.position.toArray().every((v, i) => v === before.position[i]) &&
          object.quaternion.toArray().every((v, i) => v === before.quaternion[i]) &&
          object.scale.toArray().every((v, i) => v === before.scale[i]);
      }) && [...geometryFingerprints].every(([geometry, hash]) => fingerprint(geometry) === hash);
      return {
        id: config.id,
        source: config.source,
        lightingModule: config.lightingModule,
        angle, initialAngle, modelAngle: model.rotation.y, amount, brightness: 1.2,
        paneCount: lighting.panes.length,
        windowNames: [...WINDOW_PANES],
        sourceMeshCount: sourceGeometry.length,
        sourceGeometryAndLocalTransformsUnchanged: unchanged,
        geometryFingerprints: [...geometryFingerprints].map(([geometry, hash]) => ({ geometry: geometry.uuid, hash })),
        sourceRootPosition: model.position.toArray(),
        sourceRootScale: model.scale.toArray(),
        meshes,
        lightTypes: scene.children.filter(object => object.isLight).map(object => object.type),
        depthPrioritySurfaces,
        defaults: { ...LIGHTING_DEFAULTS },
      };
    }

    setAngle(0);
    setLight(0);
    return {
      scene, camera, model, lighting, config,
      windowNames: new Set(WINDOW_PANES),
      configureRenderer, resize, setAngle, setLight, audit, dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
