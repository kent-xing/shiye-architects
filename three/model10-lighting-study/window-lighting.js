import * as THREE from '../../vendor/three.module.min.js';

// Explicit accepted model-10 facade panes, including the oculus backing.
// Exclude six roof glazing meshes and the confirmed front ground-floor entry (5).
export const WINDOW_PANES = new Set([
  "Front_gable_end_|_10_recessed_glazing",
  "Front_gable_end_|_11_recessed_glazing",
  "Front_gable_end_|_1_recessed_glazing",
  "Front_gable_end_|_2_recessed_glazing",
  "Front_gable_end_|_3_recessed_glazing",
  "Front_gable_end_|_4_recessed_glazing",
  "Front_gable_end_|_6_recessed_glazing",
  "Front_gable_end_|_7_recessed_glazing",
  "Front_gable_end_|_8_recessed_glazing",
  "Front_gable_end_|_9_recessed_glazing",
  "Garden_centre_gabled_face_|_1_recessed_glazing",
  "Garden_centre_gabled_face_|_2_recessed_glazing",
  "Garden_centre_gabled_face_|_3_recessed_glazing",
  "Garden_front_gabled_face_|_1_recessed_glazing",
  "Garden_front_gabled_face_|_2_recessed_glazing",
  "Garden_long_face_rear_|_1_recessed_glazing",
  "Garden_long_face_rear_|_2_recessed_glazing",
  "Garden_oculus_shadow",
  "Garden_rear_projecting_bay_|_1_recessed_glazing",
  "Rear_end_|_1_recessed_glazing",
  "Rear_end_|_2_recessed_glazing",
  "Rear_end_|_3_recessed_glazing",
  "Rear_end_|_4_recessed_glazing",
  "Rear_end_|_5_recessed_glazing",
  "Rear_end_|_6_recessed_glazing",
  "Service_long_side_|_1_recessed_glazing",
  "Service_long_side_|_2_recessed_glazing",
  "Service_wing_back_return_|_1_recessed_glazing",
  "Service_wing_back_return_|_2_recessed_glazing",
  "Service_wing_outer_gable_face_|_1_recessed_glazing",
  "Service_wing_outer_gable_face_|_2_recessed_glazing",
  "Service_wing_outer_gable_face_|_3_recessed_glazing",
  "Service_wing_outer_gable_face_|_4_recessed_glazing"
]);
export const LIGHTING_DEFAULTS = Object.freeze({ color:'#ff9a45', brightness:1.20, fadeSeconds:.32, revolutionSeconds:72 });

export function createWindowLighting(model){
  const panes=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh || !WINDOW_PANES.has(mesh.name))return;
    const original=mesh.material;
    mesh.material=original.clone(); // The source glass is shared by the excluded door and six roof panes.
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
