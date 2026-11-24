import * as THREE from '../../vendor/three.module.min.js';

// Revision 3: the two additional openings explicitly circled by the user are
// doors. Seven entry panes and both rooflights retain their source materials.
export const SOURCE_WINDOW_PANES = new Set([
  "Back_long_ground_facade_|_1_recessed_glazing",
  "Back_long_ground_facade_|_3_recessed_glazing",
  "Back_right_end_lower_return_|_1_recessed_glazing",
  "Back_right_end_upper_return_|_1_recessed_glazing",
  "Back_stepped_return_|_1_recessed_glazing",
  "Back_stepped_return_|_2_recessed_glazing",
  "Back_stepped_upper_bay_|_1_recessed_glazing",
  "Back_upper_recessed_glazing_|_2_recessed_glazing",
  "Back_upper_recessed_glazing_|_3_recessed_glazing",
  "Back_upper_recessed_glazing_|_4_recessed_glazing",
  "Central_bay_right_return_|_1_recessed_glazing",
  "Central_bay_right_return_|_2_recessed_glazing",
  "East_front_upper_inner_return_|_1_recessed_glazing",
  "East_ground_end_|_1_recessed_glazing",
  "East_ground_end_|_2_recessed_glazing",
  "East_upper_end_|_1_recessed_glazing",
  "East_upper_end_|_2_recessed_glazing",
  "East_upper_recessed_terrace_|_1_recessed_glazing",
  "Front_central_projecting_lower_bay_|_1_recessed_glazing",
  "Front_central_projecting_upper_bay_|_1_recessed_glazing",
  "Front_entrance_mixed_openings_|_1_recessed_glazing",
  "Front_entrance_mixed_openings_|_2_recessed_glazing",
  "Front_entrance_mixed_openings_|_4_recessed_glazing",
  "Front_upper_left_side_return_|_1_recessed_glazing",
  "Upper_front_left_terrace_recess_|_1_recessed_glazing",
  "Upper_front_middle_facade_|_1_recessed_glazing",
  "Upper_front_middle_facade_|_2_recessed_glazing",
  "Upper_front_right_terrace_recess_|_1_recessed_glazing",
  "West_ground_end_|_1_recessed_glazing",
  "West_ground_end_|_3_recessed_glazing",
  "West_upper_end_|_2_recessed_glazing"
]);
// The source deliberately leaves this horizontal window deeply open. Add a
// removable surface just before its inner return, not at the facade plane.
export const APERTURE_LIGHTS = [{name:'window_light_East_horizontal_deep_opening',center:[1.934,.518,-.275],size:[.468,.38],normal:[1,0,0]}];
export const WINDOW_PANES = new Set([...SOURCE_WINDOW_PANES,...APERTURE_LIGHTS.map(x=>x.name)]);
export const LIGHTING_DEFAULTS = Object.freeze({color:'#ff9a45',brightness:1.20,fadeSeconds:.32,revolutionSeconds:72});

export function createWindowLighting(model){
  const sourcePanes=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh||!SOURCE_WINDOW_PANES.has(mesh.name))return;
    const original=mesh.material;mesh.material=original.clone();
    sourcePanes.push({mesh,originalColor:original.color.clone(),originalEmissive:original.emissive.clone(),originalIntensity:original.emissiveIntensity});
  });
  if(sourcePanes.length!==SOURCE_WINDOW_PANES.size)throw new Error(`窗片清单不匹配：${sourcePanes.length} / ${SOURCE_WINDOW_PANES.size}`);
  const group=new THREE.Group();group.name='Optional deep window light — separate from source';
  const effectMaterial=new THREE.MeshStandardMaterial({color:0x323232,emissive:LIGHTING_DEFAULTS.color,emissiveIntensity:1.2,roughness:1,metalness:0,transparent:true,opacity:1,depthTest:true,depthWrite:false,side:THREE.FrontSide});
  const effectPanes=APERTURE_LIGHTS.map(aperture=>{
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(...aperture.size),effectMaterial);
    mesh.name=aperture.name;mesh.position.set(...aperture.center);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...aperture.normal));
    mesh.castShadow=false;mesh.receiveShadow=false;mesh.userData.apertureSize=aperture.size;
    group.add(mesh);return {mesh,aperture};
  });
  const warm=new THREE.Color(LIGHTING_DEFAULTS.color);
  function apply(amount,brightness=LIGHTING_DEFAULTS.brightness){
    for(const {mesh,originalColor,originalEmissive,originalIntensity} of sourcePanes){
      mesh.material.color.copy(originalColor).multiplyScalar(1-.94*amount);
      if(amount===0){mesh.material.emissive.copy(originalEmissive);mesh.material.emissiveIntensity=originalIntensity;}
      else{mesh.material.emissive.copy(warm);mesh.material.emissiveIntensity=amount*brightness;}
    }
    group.visible=amount>0;effectMaterial.opacity=amount;effectMaterial.emissiveIntensity=brightness;
  }
  apply(0);return {group,panes:[...sourcePanes,...effectPanes],sourcePanes,effectPanes,apply};
}
