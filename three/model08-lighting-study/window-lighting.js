import * as THREE from '../../vendor/three.module.min.js';

// Explicit accepted model-08 facade panes. Rooflight, open rooms without glazing,
// and the circular attic hole without a pane remain unlit.
export const WINDOW_PANES = new Set([
  "Forward_wing_front_|_1_recessed_glazing",
  "Forward_wing_front_|_2_recessed_glazing",
  "Forward_wing_front_|_3_recessed_glazing",
  "Forward_wing_front_|_4_recessed_glazing",
  "Forward_wing_left_|_1_recessed_glazing",
  "Forward_wing_right_|_1_recessed_glazing",
  "Main_back_|_1_recessed_glazing",
  "Main_back_|_2_recessed_glazing",
  "Main_back_|_3_recessed_glazing",
  "Main_back_|_4_recessed_glazing",
  "Main_front_|_1_recessed_glazing",
  "Main_front_|_2_recessed_glazing",
  "Main_front_|_3_recessed_glazing",
  "Main_front_|_4_recessed_glazing",
  "Main_front_|_5_recessed_glazing",
  "Main_front_|_6_recessed_glazing",
  "Main_left_|_1_recessed_glazing",
  "Main_left_|_2_recessed_glazing",
  "Main_left_|_3_recessed_glazing",
  "Main_left_|_4_recessed_glazing",
  "Main_left_|_5_recessed_glazing",
  "Main_left_|_6_recessed_glazing",
  "Rear_left_end_|_1_recessed_glazing",
  "Rear_left_end_|_2_recessed_glazing",
  "Rear_right_end_|_1_recessed_glazing",
  "Rear_right_end_|_2_recessed_glazing",
  "Side_bay_face_|_1_recessed_glazing",
  "Side_bay_face_|_2_recessed_glazing",
  "Side_bay_face_|_3_recessed_glazing",
  "Side_projecting_two-window_bay_|_1_recessed_glazing",
  "Side_projecting_two-window_bay_|_2_recessed_glazing",
  "Tower_diagonal_0_window_0_recessed",
  "Tower_diagonal_0_window_1_recessed",
  "Tower_diagonal_0_window_2_recessed",
  "Tower_diagonal_1_window_0_recessed",
  "Tower_diagonal_1_window_1_recessed",
  "Tower_diagonal_1_window_2_recessed",
  "Tower_side_window_0_recessed",
  "Tower_side_window_1_recessed",
  "Tower_side_window_2_recessed",
  "Tower_window_0_recessed",
  "Tower_window_1_recessed",
  "Tower_window_2_recessed",
  "Two-window_bay_attic_recessed_glass",
  "West_attic_recessed_glazing",
  "West_projecting_three-bay_front_|_1_recessed_glazing",
  "West_projecting_three-bay_front_|_2_recessed_glazing",
  "West_projecting_three-bay_front_|_3_recessed_glazing",
  "West_projecting_three-bay_front_|_4_recessed_glazing",
  "West_projecting_three-bay_front_|_5_recessed_glazing",
  "West_projecting_three-bay_front_|_6_recessed_glazing"
]);
export const LIGHTING_DEFAULTS = Object.freeze({ color:'#ff9a45', brightness:1.20, fadeSeconds:.32, revolutionSeconds:72 });

export function createWindowLighting(model){
  const panes=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh || !WINDOW_PANES.has(mesh.name))return;
    const original=mesh.material;
    mesh.material=original.clone(); // The source glass material is shared with the excluded rooflight.
    panes.push({mesh,originalColor:original.color.clone(),originalEmissive:original.emissive.clone(),originalIntensity:original.emissiveIntensity});
  });
  if(panes.length!==WINDOW_PANES.size)throw new Error(`窗片清单不匹配：${panes.length} / ${WINDOW_PANES.size}`);
  const warm=new THREE.Color(LIGHTING_DEFAULTS.color);
  function apply(amount,brightness=LIGHTING_DEFAULTS.brightness){
    for(const {mesh,originalColor,originalEmissive,originalIntensity} of panes){
      // Reduce reflected pane colour as the light comes on, so NoToneMapping does
      // not clip the warm colour to pure white. All changes stay on this pane material.
      mesh.material.color.copy(originalColor).multiplyScalar(1-.94*amount);
      if(amount===0){mesh.material.emissive.copy(originalEmissive);mesh.material.emissiveIntensity=originalIntensity;}
      else{mesh.material.emissive.copy(warm);mesh.material.emissiveIntensity=amount*brightness;}
    }
  }
  return {panes,apply};
}
