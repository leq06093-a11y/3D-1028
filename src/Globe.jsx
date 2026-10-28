import React,{useEffect,useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {astronomy,geoVector,DEG} from './astro';
export default function Globe({time,layers,view,point,onPoint,onReady}){
 const host=useRef(),live=useRef({time,layers,view,point,onPoint});live.current={time,layers,view,point,onPoint};
 useEffect(()=>{
 const el=host.current,scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.01,200);camera.position.set(0,1,5.2);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2;controls.maxDistance=24;
 const loader=new THREE.TextureLoader(),textures=[];
 const texture=(name,color=false)=>{const t=loader.load('/textures/'+name,undefined,undefined,()=>onReady('纹理加载失败'));if(color)t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;};
 const root=new THREE.Group();root.rotation.z=-23.5*DEG;scene.add(root);
 const spin=new THREE.Group();root.add(spin);
 const day=texture('earth.jpg',true),night=texture('night.jpg',true),spec=texture('specular.jpg');
 const sunDir=new THREE.Vector3(1,0,0);
 const material=new THREE.ShaderMaterial({uniforms:{day:{value:day},night:{value:night},spec:{value:spec},sun:{value:sunDir}},vertexShader:`varying vec2 vUv;varying vec3 vNormal;varying vec3 vPos;void main(){vUv=uv;vec4 world=modelMatrix*vec4(position,1.);vPos=world.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}`,fragmentShader:`uniform sampler2D day;uniform sampler2D night;uniform sampler2D spec;uniform vec3 sun;varying vec2 vUv;varying vec3 vNormal;varying vec3 vPos;void main(){vec3 n=normalize(vNormal);float light=dot(n,sun);vec3 daylight=texture2D(day,vUv).rgb*(.07+.93*max(light,0.));vec3 nightlight=texture2D(night,vUv).rgb*.85*(1.-smoothstep(-.12,.12,light));vec3 h=normalize(sun+normalize(cameraPosition-vPos));float shine=pow(max(dot(n,h),0.),48.)*texture2D(spec,vUv).r*max(light,0.);gl_FragColor=vec4(daylight+nightlight+vec3(.5,.7,1.)*shine*.45,1.);}`});
 const earth=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),material);spin.add(earth);
 const clouds=new THREE.Mesh(new THREE.SphereGeometry(1.013,80,48),new THREE.MeshPhongMaterial({map:texture('clouds.png',true),transparent:true,opacity:.48,depthWrite:false}));spin.add(clouds);
 const halo=new THREE.Mesh(new THREE.SphereGeometry(1.09,64,48),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 n;varying vec3 v;void main(){float f=pow(max(0.,1.-abs(dot(normalize(n),normalize(v)))),3.);gl_FragColor=vec4(.08,.42,1.,f*.65);}`}));root.add(halo);
 scene.add(new THREE.AmbientLight(0x5577aa,.4));const sunlight=new THREE.DirectionalLight(0xfff5dd,3);scene.add(sunlight);
 const lineGroups={};const line=(points,color,parent,opacity=.65)=>{const obj=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity}));parent.add(obj);return obj;};
 for(const name of ['equator','tropics','grid']){const group=new THREE.Group();spin.add(group);lineGroups[name]=group;}
 const latitude=(lat,color,group)=>line(Array.from({length:181},(_,i)=>geoVector(lat,i*2,1.006)),color,group);
 latitude(0,0x41e6cc,lineGroups.equator);[-23.5,23.5].forEach(lat=>latitude(lat,0xf7c772,lineGroups.tropics));
 for(let lat=-60;lat<=60;lat+=30)latitude(lat,0x47728b,lineGroups.grid);
 for(let lon=0;lon<360;lon+=30)line(Array.from({length:181},(_,i)=>geoVector(i-90,lon,1.005)),0x47728b,lineGroups.grid,.35);
 const terminator=new THREE.Group();scene.add(terminator);lineGroups.terminator=terminator;
 line(Array.from({length:181},(_,i)=>new THREE.Vector3(0,Math.cos(i*2*DEG)*1.018,Math.sin(i*2*DEG)*1.018)),0xffb85c,terminator,.85);
 const marker=new THREE.Mesh(new THREE.SphereGeometry(.017,16,16),new THREE.MeshBasicMaterial({color:0x7affe4}));spin.add(marker);
 const orbit=new THREE.Group();scene.add(orbit);line(Array.from({length:361},(_,i)=>new THREE.Vector3(7*Math.cos(i*DEG),0,7*Math.sin(i*DEG))),0x254252,orbit);
 const sunMesh=new THREE.Mesh(new THREE.SphereGeometry(.4,32,32),new THREE.MeshBasicMaterial({color:0xffcf77}));orbit.add(sunMesh);
 const positions=new Float32Array(4200);for(let i=0;i<1400;i++){const v=new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(40+Math.random()*30);v.toArray(positions,i*3);}const stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(positions,3)),new THREE.PointsMaterial({color:0x92b6d3,size:.035,transparent:true,opacity:.65}));scene.add(stars);
 let lastView='',frame;const resize=()=>{const {width,height}=el.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();
 let down;const pointerDown=e=>{down=[e.clientX,e.clientY];};const click=e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=el.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObject(earth)[0];if(hit){const p=earth.worldToLocal(hit.point.clone()).normalize();live.current.onPoint({lat:Math.asin(p.y)/DEG,lon:Math.atan2(-p.z,p.x)/DEG});}};
 renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',click);
 const animate=()=>{frame=requestAnimationFrame(animate);const {time,layers,view,point}=live.current,a=astronomy(time);spin.rotation.y=a.sidereal-Math.PI/2;const celestial=geoVector(a.dec,(a.subLon*DEG+a.sidereal)/DEG-90);sunDir.copy(celestial).applyAxisAngle(new THREE.Vector3(0,0,1),-23.5*DEG).normalize();sunlight.position.copy(sunDir).multiplyScalar(10);terminator.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),sunDir);marker.position.copy(geoVector(point.lat,point.lon,1.024));for(const key in lineGroups)lineGroups[key].visible=layers[key];clouds.rotation.y=(time/86400000%365)*.035;clouds.visible=layers.clouds;halo.visible=layers.atmosphere;
 const angle=a.lambda;orbit.position.copy(sunDir).multiplyScalar(7);orbit.visible=view==='orbit';sunMesh.position.set(0,0,0);
 if(lastView!==view){lastView=view;if(view==='orbit')camera.position.set(0,10,16);else if(view==='solar')camera.position.copy(sunDir).multiplyScalar(5);else camera.position.set(0,.7,4.7);controls.target.set(0,0,0);}if(view==='solar')camera.position.lerp(sunDir.clone().multiplyScalar(4.7),.04);controls.update();renderer.render(scene,camera);};animate();onReady('场景已就绪');
 return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',click);scene.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});textures.forEach(t=>t.dispose());renderer.dispose();el.removeChild(renderer.domElement);};
 },[]);
 return <div className="globe-canvas" ref={host}/>;
}
