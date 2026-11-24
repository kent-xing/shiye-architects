import * as THREE from '../../vendor/three.module.min.js';

// These are optional light surfaces for existing Boolean apertures. No source
// mesh or material is changed. Coordinates come from the accepted Blender build.
export const APERTURE_LIGHTS = [
  {"name":"window_light_Long_open_colonnade__opening_01","center":[1.15,1.8432012208523223,1.4807318307213033],"size":[0.15576903159967662,0.3265986323710904],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_02","center":[1.15,1.841101686634686,0.8020239073227124],"size":[0.40054893839916844,0.35381518506868126],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_03","center":[1.15,1.8330317135980443,0.28464819522378654],"size":[0.3894225789991915,0.35381518506868126],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_04","center":[1.15,1.8253734949627138,-0.24385387627511626],"size":[0.35604350079926084,0.35381518506868126],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_05","center":[1.15,1.837715936449265,-0.7612295883740421],"size":[0.1891481097996073,0.2857738033247041],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_06","center":[1.15,1.8236755245936178,-1.117273089173303],"size":[0.32266442259933015,0.31299035602229497],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_07","center":[1.15,1.8288020735044606,-1.623522441872252],"size":[0.24477990679949183,0.2857738033247041],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_08","center":[1.15,1.2625746362685362,1.3583418773215574],"size":[0.40054893839916844,0.3265986323710904],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_09","center":[1.15,1.2897606173078158,0.8075870870227009],"size":[0.3894225789991915,0.31299035602229497],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_10","center":[1.15,1.3095248285707308,0.2735218358238096],"size":[0.41167529779914536,0.4490731195102493],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_11","center":[1.15,1.2676400418627565,-0.24941705597510472],"size":[0.3449171413992839,0.35381518506868126],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_12","center":[1.15,1.280805992151929,-0.7890454868739843],"size":[0.333790781999307,0.3402069087198858],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_13","center":[1.15,1.220783630680741,-1.1895944252731527],"size":[0.17802175039963042,0.43546484316145384],"normal":[1,0,0]},
  {"name":"window_light_Long_open_colonnade__opening_14","center":[1.15,1.2543721860458772,-1.5456379260724138],"size":[0.40054893839916844,0.3402069087198858],"normal":[1,0,0]},
  {"name":"window_light_Rear_facade_south_wing__opening_01","center":[-1.15,1.6666245073669386,-1.8639591764321775],"size":[0.29248992522764533,0.2585572506271132],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_south_wing__opening_02","center":[-1.15,1.603280786658378,-1.4758475448801096],"size":[0.43873488784146797,0.2721655269759087],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_south_wing__opening_03","center":[-1.15,1.1031254245784612,-1.875208788940933],"size":[0.35998760028017884,0.2449489742783178],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_south_wing__opening_04","center":[-1.15,1.0001612774085158,-1.4364739010994652],"size":[0.38248682529769,0.2721655269759087],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_south_wing__opening_05","center":[-1.15,0.987939782371153,-0.7108738942847296],"size":[0.3037395377364009,0.35381518506868126],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_south_wing__opening_06","center":[-1.15,0.5155207533087232,-1.9145824327215777],"size":[0.25874108770137855,0.23134069792952236],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_south_wing__opening_07","center":[-1.15,0.46889627316528837,-1.5545948324413987],"size":[0.2812403127188897,0.21773242158072692],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_south_wing__opening_08","center":[-1.15,0.4940063487238982,-1.1664832008893309],"size":[0.17999380014008942,0.21773242158072692],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_north_wing__opening_01","center":[-1.15,1.464794127539507,0.3297152627751624],"size":[0.38248682529769,0.2857738033247041],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_north_wing__opening_02","center":[-1.15,1.4398264476057985,0.6784532505465857],"size":[0.26999070021013416,0.2585572506271132],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_north_wing__opening_03","center":[-1.15,1.5110412229879462,1.5109245761944992],"size":[0.17999380014008942,0.2857738033247041],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_north_wing__opening_04","center":[-1.15,0.9687142336517404,0.32409045652078455],"size":[0.3937364378064456,0.2721655269759087],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_north_wing__opening_05","center":[-1.15,0.9802560159630849,0.6503292192746967],"size":[0.23624186268386738,0.2585572506271132],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_north_wing__opening_06","center":[-1.15,0.9527195984532499,1.1453121696599426],"size":[0.37123721278893446,0.2857738033247041],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_north_wing__opening_07","center":[-1.15,0.36404801068432335,-0.11464443132068339],"size":[0.191243412648845,0.2993820796734995],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_north_wing__opening_08","center":[-1.15,0.3606571647572791,0.3465896815382957],"size":[0.43873488784146797,0.2585572506271132],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_north_wing__opening_09","center":[-1.15,0.3418714301547017,0.7009524755640968],"size":[0.17999380014008942,0.2993820796734995],"normal":[-1,0,0]},
  {"name":"window_light_Rear_facade_north_wing__opening_10","center":[-1.15,0.31628155737772656,1.0553152695898977],"size":[0.191243412648845,0.2721655269759087],"normal":[-1,0,0]},
  {"name":"window_light_Front_gable_end__opening_01","center":[-0.20035681878094,1.8311078005792183,1.7],"size":[0.2336535473995149,0.2721655269759087],"normal":[0,0,1]},
  {"name":"window_light_Front_gable_end__opening_02","center":[-0.20035681878094,1.1847146740114354,1.7],"size":[0.2336535473995149,0.31299035602229497],"normal":[0,0,1]},
  {"name":"window_light_Back_gable_end__opening_01","center":[0.7307035236963666,1.7119992410564617,-1.85],"size":[0.19124341264884498,0.3265986323710904],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_02","center":[0.2975934421092764,1.739495675464765,-1.85],"size":[0.2474914751926229,0.31299035602229497],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_03","center":[-0.5405026897930149,1.7301403364954633,-1.85],"size":[0.1687441876313338,0.35381518506868126],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_04","center":[-0.9736127713801048,1.7508326327293697,-1.85],"size":[0.47248372536773464,0.38103173776627214],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_05","center":[0.7419531362051222,1.1255989723717252,-1.85],"size":[0.21374263766635615,0.3265986323710904],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_06","center":[0.2638446045830097,1.1376605350029658,-1.85],"size":[0.20249302515760056,0.3265986323710904],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_07","center":[-0.05676935191652458,1.145908974371548,-1.85],"size":[0.326238762753912,0.3265986323710904],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_08","center":[-0.5461274960473926,1.1388025081661277,-1.85],"size":[0.15749457512257822,0.3402069087198858],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_09","center":[-0.9792375776344826,1.1799072189232271,-1.85],"size":[0.48373333787649025,0.3265986323710904],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_10","center":[0.7700771674770112,0.5645486778547814,-1.85],"size":[0.3374883752626676,0.3265986323710904],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_11","center":[0.07822599818854246,0.559428739483751,-1.85],"size":[0.6187286879815573,0.3265986323710904],"normal":[0,0,-1]},
  {"name":"window_light_Back_gable_end__opening_13","center":[-0.861116646292549,0.6769432206580017,-1.85],"size":[0.15749457512257822,0.1632993161855452],"normal":[0,0,-1]}
];
export const WINDOW_PANES = new Set(APERTURE_LIGHTS.map(x=>x.name));
export const LIGHTING_DEFAULTS = Object.freeze({color:'#ff9a45',brightness:1.20,fadeSeconds:.32,revolutionSeconds:72});

export function createWindowLighting(){
  const group=new THREE.Group();group.name='Window light effect — separate from accepted source';
  const material=new THREE.MeshStandardMaterial({color:0x323232,emissive:LIGHTING_DEFAULTS.color,emissiveIntensity:LIGHTING_DEFAULTS.brightness,roughness:1,metalness:0,transparent:true,opacity:1,depthTest:true,depthWrite:false,side:THREE.FrontSide});
  const panes=APERTURE_LIGHTS.map(aperture=>{
    // Retain a small edge reveal and place the effect behind the inner wall face.
    const size=aperture.size.map(v=>v-.01),normal=new THREE.Vector3(...aperture.normal);
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(...size),material);
    mesh.name=aperture.name;mesh.position.set(...aperture.center).addScaledVector(normal,-.032);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
    mesh.castShadow=false;mesh.receiveShadow=false;mesh.userData.apertureSize=size;
    group.add(mesh);return {mesh,aperture};
  });
  function apply(amount,brightness=LIGHTING_DEFAULTS.brightness){
    // Fully remove the optional layer at zero, preserving the accepted open holes.
    group.visible=amount>0;material.opacity=amount;material.emissiveIntensity=brightness;
  }
  apply(0);return {group,panes,apply};
}
