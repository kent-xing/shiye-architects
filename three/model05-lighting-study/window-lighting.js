import * as THREE from '../../vendor/three.module.min.js';

// Accepted model-05 windows plus the rear courtyard pane requested by the user.
// Keep the entrance, four west boundary holes, garage portal and roof accent unlit.
export const WINDOW_PANES = new Set([
  "Back_long_main_wall_|_1_recessed_glazing",
  "Back_long_main_wall_|_2_recessed_glazing",
  "Back_long_main_wall_|_3_recessed_glazing",
  "Back_long_main_wall_|_4_recessed_glazing",
  "Back_long_main_wall_|_5_recessed_glazing",
  "Back_long_main_wall_|_6_recessed_glazing",
  "Back_long_main_wall_|_7_recessed_glazing",
  "Back_long_main_wall_|_8_recessed_glazing",
  "Back_long_main_wall_|_9_recessed_glazing",
  "Back_long_main_wall_|_10_recessed_glazing",
  "Back_long_main_wall_|_11_recessed_glazing",
  "Back_long_main_wall_|_12_recessed_glazing",
  "Back_recessed_secondary_wall_|_1_recessed_glazing",
  "Back_recessed_secondary_wall_|_2_recessed_glazing",
  "Back_recessed_secondary_wall_|_3_recessed_glazing",
  "Back_recessed_secondary_wall_|_4_recessed_glazing",
  "Back_recessed_secondary_wall_|_5_recessed_glazing",
  "Back_recessed_secondary_wall_|_6_recessed_glazing",
  "East_end_mid_wall_|_1_recessed_glazing",
  "East_end_mid_wall_|_2_recessed_glazing",
  "East_end_mid_wall_|_3_recessed_glazing",
  "East_end_mid_wall_|_4_recessed_glazing",
  "East_end_mid_wall_|_5_recessed_glazing",
  "East_end_projecting_bay_|_1_recessed_glazing",
  "East_end_projecting_bay_|_2_recessed_glazing",
  "East_end_projecting_bay_|_3_recessed_glazing",
  "East_end_projecting_bay_|_4_recessed_glazing",
  "East_end_projecting_bay_|_5_recessed_glazing",
  "East_end_projecting_bay_|_6_recessed_glazing",
  "Garage_east_side_|_1_recessed_glazing",
  "Garage_east_side_|_2_recessed_glazing",
  "Garage_front_wall_|_2_recessed_glazing",
  "Main_front_recessed_wall_|_1_recessed_glazing",
  "Main_front_recessed_wall_|_2_recessed_glazing",
  "Main_front_recessed_wall_|_3_recessed_glazing",
  "Main_front_recessed_wall_|_4_recessed_glazing",
  "Main_front_recessed_wall_|_5_recessed_glazing",
  "Main_front_recessed_wall_|_6_recessed_glazing",
  "Main_front_recessed_wall_|_7_recessed_glazing",
  "Main_west_courtyard_lower_facade_|_1_recessed_glazing",
  "Main_west_courtyard_lower_facade_|_2_recessed_glazing",
  "Main_west_courtyard_lower_facade_|_3_recessed_glazing",
  "Main_west_courtyard_upper_paired_facade_|_1_recessed_glazing",
  "Main_west_courtyard_upper_paired_facade_|_2_recessed_glazing",
  "Pavilion_east_face_|_1_recessed_glazing",
  "Pavilion_east_face_|_2_recessed_glazing",
  "Pavilion_east_face_|_3_recessed_glazing",
  "Pavilion_east_face_|_4_recessed_glazing",
  "Pavilion_east_face_|_5_recessed_glazing",
  "Pavilion_east_face_|_6_recessed_glazing",
  "Pavilion_front_face_|_1_recessed_glazing",
  "Pavilion_front_face_|_2_recessed_glazing",
  "Pavilion_front_face_|_3_recessed_glazing",
  "Pavilion_front_face_|_4_recessed_glazing",
  "Pavilion_front_face_|_5_recessed_glazing",
  "Pavilion_front_face_|_6_recessed_glazing",
  "Rear_courtyard_wall_|_1_recessed_glazing"
]);
export const LIGHTING_DEFAULTS = Object.freeze({ color:'#ff9a45', brightness:1.20, fadeSeconds:.32, revolutionSeconds:72 });

export function createWindowLighting(model){
  const panes=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh || !WINDOW_PANES.has(mesh.name))return;
    const original=mesh.material;
    mesh.material=original.clone(); // Keep every original and excluded material untouched.
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
