import * as THREE from 'https://esm.sh/three@0.170.0';
const scene=new THREE.Scene();scene.background=new THREE.Color('#10091f');scene.fog=new THREE.Fog('#10091f',12,33);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,100);camera.position.set(0,6,13);camera.lookAt(0,1,0);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));document.querySelector('#scene').append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd7b5ff,0x180d27,2));const neon=new THREE.PointLight(0xbb45ff,50,22);neon.position.set(0,6,0);scene.add(neon);
function box(w,h,d,x,y,z,color,metal=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,metalness:metal,roughness:.38}));m.position.set(x,y,z);scene.add(m);return m}
box(18,.25,16,0,-.18,0,0x21172e);box(18,7,.2,0,3.2,-7,0x130f1d);box(.2,7,16,-9,3.2,0,0x130f1d);box(.2,7,16,9,3.2,0,0x130f1d);
for(let x=-7;x<=7;x+=2)box(.08,5,.08,x,2.8,-6.85,0x9c4be5);
box(9,.3,3,0,.15,-4.5,0x3c2859);box(8,.09,.1,0,.34,-2.95,0xe65cff);
for(let x of [-5,0,5]){box(3,.55,1.5,x,.3,3.3,0x332242);box(2.4,.15,1.2,x,.35,1.4,0x68438a);box(2.4,.06,1.2,x,.47,1.4,0xd7b57e)}

const avatars=[];
const material=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness:.7,metalness});
function part(group,geometry,mat,x,y,z,rx=0,ry=0,rz=0){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);group.add(m);return m}
function tattooTexture(){
 const c=document.createElement('canvas');c.width=256;c.height=512;
 const ctx=c.getContext('2d');ctx.fillStyle='#bd9278';ctx.fillRect(0,0,256,512);
 ctx.strokeStyle='#19202a';ctx.lineWidth=5;ctx.lineCap='round';
 for(let i=0;i<13;i++){const y=25+i*36;ctx.beginPath();ctx.moveTo(30,y);ctx.bezierCurveTo(95,y-38,150,y+35,230,y-15);ctx.stroke();}
 for(let i=0;i<9;i++){const x=35+(i%3)*75,y=60+Math.floor(i/3)*145;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x-20,y-22);ctx.lineTo(x+20,y+22);ctx.moveTo(x+20,y-22);ctx.lineTo(x-20,y+22);ctx.stroke();}
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map:texture,roughness:.88});
}
const ink=tattooTexture();
function avatar(x,z,index){
 const g=new THREE.Group(),tattoo=index%3===0,female=index%3===1;
 const skin=material(index%4===0?0xc18e72:0xe3b298),outfit=material(tattoo?0x16171e:female?0x6b285f:0x292b3d);
 const hair=material(index%4===1?0x4c2930:0x111018),shoe=material(0x101017),eye=material(0x17151c);
 const body=part(g,new THREE.CapsuleGeometry(female?.27:.35,.66,6,12),outfit,0,1.28,0);
 if(female)part(g,new THREE.ConeGeometry(.43,.73,14),outfit,0,.87,0);
 const neck=part(g,new THREE.CylinderGeometry(.105,.12,.18,12),skin,0,1.86,0);
 const head=part(g,new THREE.SphereGeometry(.275,20,16),skin,0,2.13,0);
 head.scale.set(.85,1.12,.84);
 part(g,new THREE.SphereGeometry(.285,18,12,0,Math.PI*2,0,Math.PI*.44),hair,0,2.23,0);
 if(female){part(g,new THREE.CapsuleGeometry(.09,.7,5,10),hair,-.23,1.89,.02);part(g,new THREE.CapsuleGeometry(.09,.7,5,10),hair,.23,1.89,.02)}
 for(const side of [-1,1]){
  part(g,new THREE.SphereGeometry(.034,8,8),eye,side*.105,2.15,.226);
  part(g,new THREE.CapsuleGeometry(.105,.57,5,10),tattoo?ink:skin,side*.44,1.38,0,0,0,side*.16);
  part(g,new THREE.CapsuleGeometry(.125,.65,5,10),outfit,side*.16,.51,0);
  part(g,new THREE.BoxGeometry(.23,.13,.37),shoe,side*.16,.085,.12);
 }
 if(tattoo){part(g,new THREE.TorusGeometry(.19,.018,8,24),material(0x28202c),0,1.48,.34,0,0,.12);}
 g.position.set(x,0,z);g.rotation.y=(index%5-2)*.16;scene.add(g);avatars.push(g);return g;
}
for(let i=0;i<10;i++)avatar(-6+(i%5)*3,-4+Math.floor(i/5)*5,i);
let pulse=0,danceUntil=0;const toast=document.querySelector('#toast');function gift(e){toast.textContent=`${e.name} tặng ${e.points} 💎 · ${e.gift}`;pulse=performance.now()+2200;if(e.gift==='dancer'||e.gift==='party')danceUntil=performance.now()+6000;if(e.gift==='party')pulse=performance.now()+7000;}
function connect(){const ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/events');ws.onmessage=m=>{const e=JSON.parse(m.data);if(e.ranking)document.querySelector('#list').replaceChildren(...e.ranking.map(v=>{const li=document.createElement('li');li.textContent=`${v.name}: ${v.points} 💎`;return li}));if(e.type==='gift')gift(e)};ws.onclose=()=>setTimeout(connect,1500)}connect();
document.querySelectorAll('[data-gift]').forEach(b=>b.onclick=async()=>{try{const r=await fetch('/api/demo-gift',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.querySelector('#name').value,gift:b.dataset.gift})});if(!r.ok)toast.textContent='Tên hoặc quà không hợp lệ'}catch{toast.textContent='Không kết nối được máy chủ'}});
function tick(t){requestAnimationFrame(tick);const active=t<danceUntil;avatars.forEach((a,i)=>{a.rotation.y=active?Math.sin(t*.005+i)*.45:Math.sin(t*.0005+i)*.08;a.position.y=active?Math.abs(Math.sin(t*.008+i))*.25:0});neon.color.setHSL((t<pulse?t*.001:.76)%1,.8,.55);neon.intensity=t<pulse?70:35;renderer.render(scene,camera)}requestAnimationFrame(tick);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});