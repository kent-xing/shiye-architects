import {
  createWindowLighting as createAcceptedWindowLighting,
  WINDOW_PANES as ACCEPTED_WINDOW_PANES,
} from './window-lighting.js';

export { LIGHTING_DEFAULTS } from './window-lighting.js';

// These two unnamed GLB meshes sit at the back of the lower and upper
// low-wall openings, respectively.
const LOW_WALL_PANES = ['mesh_42', 'mesh_43'];
export const WINDOW_PANES = new Set([...ACCEPTED_WINDOW_PANES, ...LOW_WALL_PANES]);

export function createWindowLighting(model) {
  const lowWallMeshes = LOW_WALL_PANES.map(name => {
    const mesh = model.getObjectByName(name);
    if (!mesh?.isMesh) throw new Error(`Missing low-wall window: ${name}`);
    return mesh;
  });

  const lighting = createAcceptedWindowLighting(model);
  for (const mesh of lowWallMeshes) {
    const original = mesh.material;
    mesh.material = original.clone();
    // The existing light transition reads this same pane list on every frame.
    lighting.panes.push({
      mesh,
      originalColor: original.color.clone(),
      originalEmissive: original.emissive.clone(),
      originalIntensity: original.emissiveIntensity,
    });
  }
  return lighting;
}
