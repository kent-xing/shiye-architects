import * as THREE from '../../vendor/three.module.min.js';

// Explicit accepted model-11 facade panes, including vertical dormer glazing.
// Exclude the rear open-balcony dark surface and perimeter-wall blind recesses.
export const WINDOW_PANES = new Set([
  "Back_bay_east_return_with_slender_window_|_1_recessed_glazing",
  "Back_bay_west_return_with_window_|_1_recessed_glazing",
  "Back_low_glazed_annex_front_|_1_recessed_glazing",
  "Back_low_glazed_annex_front_|_2_recessed_glazing",
  "Back_low_glazed_annex_front_|_3_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_10_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_11_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_12_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_13_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_14_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_3_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_4_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_5_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_6_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_7_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_8_recessed_glazing",
  "Back_negative_Z_|_entrance_gable_|_9_recessed_glazing",
  "Back_projecting_bay_front_|_1_recessed_glazing",
  "Back_projecting_bay_front_|_2_recessed_glazing",
  "Back_projecting_bay_front_|_3_recessed_glazing",
  "Dormer_glazing_-043_-1",
  "Dormer_glazing_-043_1",
  "Dormer_glazing_009_-1",
  "Dormer_glazing_009_1",
  "East_side_positive_X_|_distinct_facade_|_1_recessed_glazing",
  "East_side_positive_X_|_distinct_facade_|_2_recessed_glazing",
  "East_side_positive_X_|_distinct_facade_|_3_recessed_glazing",
  "East_side_positive_X_|_distinct_facade_|_4_recessed_glazing",
  "East_side_positive_X_|_distinct_facade_|_5_recessed_glazing",
  "East_side_positive_X_|_distinct_facade_|_6_recessed_glazing",
  "East_side_positive_X_|_distinct_facade_|_7_recessed_glazing",
  "East_side_positive_X_|_distinct_facade_|_8_recessed_glazing",
  "East_side_positive_X_|_distinct_facade_|_9_recessed_glazing",
  "Front_gable_triangle_attic_dark_recess_0",
  "Front_gable_triangle_attic_dark_recess_1",
  "Front_positive_Z_|_three_storey_gable_facade_|_10_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_11_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_12_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_13_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_14_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_15_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_1_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_2_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_3_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_4_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_5_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_6_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_7_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_8_recessed_glazing",
  "Front_positive_Z_|_three_storey_gable_facade_|_9_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_10_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_11_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_12_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_1_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_2_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_3_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_4_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_5_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_6_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_7_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_8_recessed_glazing",
  "West_side_negative_X_|_distinct_facade_|_9_recessed_glazing"
]);
export const LIGHTING_DEFAULTS = Object.freeze({ color:'#ff9a45', brightness:1.20, fadeSeconds:.32, revolutionSeconds:72 });

export function createWindowLighting(model){
  const panes=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh || !WINDOW_PANES.has(mesh.name))return;
    const original=mesh.material;
    mesh.material=original.clone(); // Attic glass is shared with the excluded rear balcony dark surface.
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
