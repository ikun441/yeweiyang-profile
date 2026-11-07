import * as THREE from 'three';

// All motion is derived from the journey clock: pause and reduced motion freeze every model.
export function addProjectScenes({ groups, mesh, box, ball, ring, label, animations, addLogo, materials }) {
  const { metal, silver, lavender, green, charcoal, cream } = materials;
  const pink = new THREE.MeshPhysicalMaterial({ color: 0xe497c7, metalness: .38, roughness: .23, clearcoat: 1 });
  const blue = new THREE.MeshPhysicalMaterial({ color: 0x75a7c0, metalness: .4, roughness: .25, clearcoat: 1 });
  const tube = (parent, points, material, radius = .018) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    mesh(new THREE.TubeGeometry(curve, 48, radius, 7, false), material, parent);
    return curve;
  };

  // 05 — Soulbot: a glass observatory, breathing core, memory beads, and the real brand artwork.
  {
    const g = groups[5].sculpture;
    const globe = mesh(new THREE.IcosahedronGeometry(1.42, 4), new THREE.MeshPhysicalMaterial({ color: 0xe9b6d8, transparent: true, opacity: .18, metalness: .05, roughness: .12, depthWrite: false, side: THREE.DoubleSide }), g);
    const core = mesh(new THREE.TorusKnotGeometry(.61, .18, 128, 18, 2, 3), pink, g, [0, .15, 0]);
    const orbits = [];
    for (let i = 0; i < 3; i++) {
      const orbit = new THREE.Group(); orbit.rotation.set(.55 + i * .72, i * .8, -.4); g.add(orbit);
      ring(orbit, 1.7 + i * .22, .018, i % 2 ? lavender : silver);
      const bead = ball(orbit, i % 2 ? green : pink, [1.7 + i * .22, 0, 0], .10);
      orbits.push({ orbit, bead, radius: 1.7 + i * .22 });
    }
    const logo = addLogo(g, 'soulbot', [0, .15, 1.6], 1.65);
    const memory = label(g, 'MEMORY', 'PERSONALITY / CONTINUITY', [-1.1, -1.42, .8], [1.65, .55], '#60475d', '#f1d9ed');
    label(g, 'SOULBOT', 'v2.2 / MULTIMODAL COMPANION', [.65, 1.95, .25], [2.2, .73], '#e2b4d4', '#49324a');
    animations.push(t => {
      core.rotation.set(t * .16, t * .24, .2); core.scale.setScalar(1 + Math.sin(t * 1.4) * .08);
      globe.rotation.y = t * .07;
      logo.position.y = .15 + Math.sin(t * .8) * .08;
      orbits.forEach(({ orbit, bead, radius }, i) => { orbit.rotation.y = i * .8 + t * .12 * (i % 2 ? -1 : 1); bead.position.set(Math.cos(t * .5 + i) * radius, Math.sin(t * .5 + i) * radius, 0); });
      memory.position.y = -1.42 + Math.sin(t * .7) * .09;
    });
  }

  // 06 — ERP: a miniature warehouse with real parcels circulating through an approval conveyor.
  {
    const g = groups[6].sculpture;
    const rig = new THREE.Group(); rig.rotation.y = -.28; g.add(rig);
    const loop = new THREE.CatmullRomCurve3([[-1.75,-1.1,1.1],[1.75,-1.1,1.1],[2,-1.1,-.7],[0,-1.1,-1.4],[-2,-1.1,-.7]].map(p=>new THREE.Vector3(...p)), true);
    mesh(new THREE.TubeGeometry(loop, 100, .09, 10, true), charcoal, rig);
    const parcels = Array.from({length:7}, (_,i)=>box(rig, i%2 ? cream : blue, [0,0,0], [.39,.38,.39]));
    for(let bay=0;bay<3;bay++) {
      const x = -1.1 + bay * 1.1;
      box(rig, silver, [x-.44,.1,-.85], [.06,2.2,.07]); box(rig,silver,[x+.44,.1,-.85],[.06,2.2,.07]);
      for(let level=0;level<3;level++) {
        box(rig,blue,[x,-.8+level*.73,-.85],[.95,.06,.7]);
        box(rig,level%2 ? lavender : cream,[x,-.57+level*.73,-.85],[.57,.4,.48]);
      }
    }
    const scanner = new THREE.Group(); scanner.position.set(1.65,-.3,.9); rig.add(scanner);
    box(scanner,blue,[-.48,0,0],[.07,1.7,.08]);box(scanner,blue,[.48,0,0],[.07,1.7,.08]);box(scanner,blue,[0,.85,0],[1,.07,.08]);
    const scan=box(scanner,green,[0,0,0],[.88,.025,.12]);
    const logo=addLogo(g,'erp',[0,1.85,.5],1.2);
    label(g,'DRAFT → APPROVE','PURCHASE / STOCK / SALES',[0,-1.65,1.2],[2.7,.6],'#345564','#e7eff1');
    animations.push(t=>{
      parcels.forEach((parcel,i)=>{parcel.position.copy(loop.getPointAt(((t*.06+i/7)%1+1)%1));parcel.position.y+=.22; const v=loop.getTangentAt(((t*.06+i/7)%1+1)%1);parcel.rotation.y=Math.atan2(v.x,v.z);});
      scan.position.y=Math.sin(t*2.2)*.6;logo.position.y=1.85+Math.sin(t*.8)*.06;rig.rotation.y=-.28+Math.sin(t*.2)*.09;
    });
  }

  // 07 — Piano Island: a tilted performance stage with articulated keys and rising note particles.
  {
    const g=groups[7].sculpture;
    const piano=new THREE.Group();piano.rotation.set(.32,-.25,.04);g.add(piano);
    box(piano,charcoal,[0,-.28,0],[4.05,.4,1.6]);
    box(piano,charcoal,[0,.42,-.62],[4.05,1.1,.15]);
    const lid=box(piano,metal,[0,1.05,-.45],[4.1,.09,1.3]);lid.rotation.x=-.55;
    const keys=[];
    for(let i=0;i<21;i++) {
      const hinge=new THREE.Group();hinge.position.set(-1.85+i*.185,-.02,-.3);piano.add(hinge);
      box(hinge,cream,[0,0,.44],[.174,.12,1.0]);keys.push(hinge);
      if(![2,6].includes(i%7))box(piano,charcoal,[-1.76+i*.185,.1,-.08],[.10,.14,.55]);
    }
    for(const x of [-1.65,1.65]){box(piano,charcoal,[x,-1.13,.45],[.12,1.5,.12]);ball(piano,silver,[x,-1.85,.45],.11);}
    for(let i=0;i<12;i++)tube(piano,[[-1.7+i*.3,.65,-.72],[-1.7+i*.3,.72,-1.3]],green,.005);
    const notes=Array.from({length:14},(_,i)=>ball(g,i%3 ? lavender:green,[0,0,0],.045));
    const stave=new THREE.Group();g.add(stave);
    for(let i=0;i<5;i++)tube(stave,[[-2,1.55+i*.11,-.9],[0,1.8+i*.11,-1.1],[2,1.55+i*.11,-.9]],silver,.008);
    label(g,'PIANO ISLAND','15 CHAPTERS / PLAY TO LEARN',[0,-1.65,1.3],[2.5,.7],'#4b4160','#ece7f4');
    animations.push(t=>{
      keys.forEach((key,i)=>{key.rotation.x=Math.pow(Math.max(0,Math.sin(t*2.5-i*.68)),12)*.14;});
      notes.forEach((note,i)=>{const f=(t*.24+i/14)%1;note.position.set(Math.sin(i*2.4)*1.7,.2+f*2.2,.65+Math.sin(f*6+i)*.2);note.scale.setScalar(.045*(Math.sin(f*Math.PI)*.8+.2));});
      piano.rotation.y=-.25+Math.sin(t*.18)*.13;lid.rotation.x=-.55+Math.sin(t*.4)*.035;
    });
  }

  // 08 — Explainable emotions: a transforming wire lattice and five independently breathing axes.
  {
    const g=groups[8].sculpture;
    const lattice=mesh(new THREE.IcosahedronGeometry(1.5,2),new THREE.MeshBasicMaterial({color:0x9880be,wireframe:true,transparent:true,opacity:.28}),g);
    const axes=[];
    for(let i=0;i<5;i++){
      const angle=i*Math.PI*2/5+Math.PI/2;
      const endpoint=[Math.cos(angle)*1.85,Math.sin(angle)*1.85,0];
      tube(g,[[0,0,0],endpoint],silver,.025);
      const node=ball(g,i%2?pink:green,endpoint,.20);axes.push({node,angle});
      label(g,['O','C','E','A','N'][i],'PERSONALITY',[endpoint[0],endpoint[1],.28],[.42,.25],'#75618c','#f1e9f4');
    }
    const core=mesh(new THREE.OctahedronGeometry(.7,1),metal,g);
    const orbit=ring(g,1.05,.05,pink);orbit.rotation.x=1.0;
    label(g,'EMOTIONS / STATE','PERCEIVE → MODULATE → REMEMBER',[0,-1.78,.7],[2.8,.7],'#75618c','#f1e9f4');
    animations.push(t=>{
      core.rotation.set(t*.2,t*.3,0);lattice.rotation.set(t*.07,-t*.12,t*.04);
      orbit.rotation.y=t*.25;
      axes.forEach(({node,angle},i)=>{const r=1.7+Math.sin(t*.9+i)*.18;node.position.set(Math.cos(angle)*r,Math.sin(angle)*r,Math.sin(t*.7+i)*.35);node.scale.setScalar(.20*(1+Math.sin(t*1.2+i)*.2));});
    });
  }

  // 09 — Plugin delivery: radial modules attach, separate, then send signals to a central interface.
  {
    const g=groups[9].sculpture;
    const core=mesh(new THREE.CylinderGeometry(.65,.65,.55,6),metal,g);core.rotation.x=Math.PI/2;
    const halo=ring(g,.85,.045,green);
    const modules=[];
    for(let i=0;i<5;i++){
      const arm=new THREE.Group();arm.rotation.z=i*Math.PI*2/5;g.add(arm);
      const plug=new THREE.Group();arm.add(plug);
      box(plug,i%2?lavender:blue,[0,0,0],[.78,.62,.4]);
      for(const y of [-.12,.12])box(plug,silver,[-.47,y,0],[.22,.055,.12]);
      const signal=ball(arm,green,[0,0,0],.045);
      modules.push({plug,signal,arm});
      label(plug,['QQ','IMAGE','MEME','VOICE','LLM'][i],'MODULE',[0,0,.23],[.68,.28],'#34303e','#e9e5ef');
    }
    label(g,'PLUG / PLAY','INSTALL → CONFIGURE → ENABLE',[0,-1.85,.7],[2.8,.7],'#345564','#e6eef2');
    animations.push(t=>{
      modules.forEach(({plug,signal,arm},i)=>{const extension=.5+.5*Math.sin(t*.75-i*.65);plug.position.x=1.3+extension*.8;signal.position.set(.7+((t*.5+i*.2)%1)*(plug.position.x-.7),0,0);arm.rotation.z=i*Math.PI*2/5+Math.sin(t*.18)*.12;});
      core.rotation.y=t*.2;halo.rotation.set(Math.sin(t*.4)*.4,t*.2,0);
    });
  }
}
