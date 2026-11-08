(function(root){
  'use strict';
  function create(ctx){
    const {C,D,BASE,esc,button,img,baseState,draw,mark,inform,finish,announce,getShell}=ctx;
    const M=root.LVMechanics;
    const stats=items=>`<div class="play-stats">${items.map(([a,b])=>`<span><strong>${a}</strong>${b}</span>`).join('')}</div>`;

    function puzzle(meta){
      const s=baseState(meta,4);s.models=C.shuffle(D.cells);s.round=0;s.moves=0;s.helps=0;s.scoreLabel='modelos reconstruidos';
      function prepare(){s.model=s.models[s.round];s.rows=['neurona','cardiaca'].includes(s.model.id)?2:3;s.order=C.shuffle(Array.from({length:s.rows*3},(_,i)=>i));if(s.order.every((v,i)=>v===i))s.order.reverse();s.selected=null;s.solved=false;s.peek=false;s.feedback=null;s.part='membrana';}
      prepare();
      function exchange(a,b){
        if(s.solved||a===b)return;s.order=M.swap(s.order,a,b);s.selected=null;s.moves++;s.feedback=null;
        if(s.order.every((v,i)=>v===i)){s.solved=true;mark(s,'model'+s.round,true,s.model.name,'Las partes mantienen su función aunque las células tengan distintas formas.');inform(s,true,'Modelo reconstruido. Explora ahora sus cuatro partes antes de seguir.');}
        draw();
      }
      s.view=()=>`<div class="activity-top"><span>Modelo ${s.round+1} de 4</span><span class="mini-badge">Puzle de imágenes</span></div><h2 class="question">${s.solved?'Explora el modelo: '+s.model.name.toLowerCase(): 'Reconstruye el modelo: '+s.model.name.toLowerCase()}.</h2><p class="instruction">${s.solved?'Toca una parte para verla en el modelo y recordar su función.':'Arrastra una pieza sobre otra para intercambiarlas. También puedes tocar dos piezas, una después de otra.'}</p>${stats([[s.moves,'intercambios'],[s.helps,'pistas usadas']])}<div class="puzzle-layout"><div>${s.solved?`<div class="cell-map puzzle-solved">${img(s.model.id,s.model.name)}${Object.entries(s.model.points).map(([id,xy],i)=>button(i+1,'part',`data-id="${id}" data-focus="point-${id}" aria-label="Explorar ${D.parts[id].name}" style="left:${xy[0]*100}%;top:${xy[1]*100}%"`,'hotspot '+(s.part===id?'ok':''))).join('')}</div>`:`<div class="jigsaw-board" style="--puzzle-rows:${s.rows}" aria-label="Puzle de ${esc(s.model.name)}">${s.order.map((piece,i)=>button(`<span class="jigsaw-fragment" style="background-image:url('${BASE}assets/${s.model.id}.webp');background-size:300% ${s.rows*100}%;background-position:${(piece%3)*50}% ${Math.floor(piece/3)*100/(s.rows-1)}%"></span><span class="tile-number" aria-hidden="true">${i+1}</span>`,'piece',`data-id="${i}" data-grab-value="${i}" data-drop="${i}" data-focus="piece-${i}" aria-label="Posición ${i+1}. ${s.order[i]===i?'Pieza bien colocada':'Pieza por colocar'}." aria-pressed="${s.selected===i}"`,'jigsaw-tile '+(s.selected===i?'selected':''))).join('')}</div>`}</div><aside class="puzzle-sidebar">${s.solved?`<div class="parts-tabs">${Object.entries(D.parts).map(([id,p],i)=>button(`${i+1}. ${p.name}`,'part',`data-id="${id}" data-focus="part-${id}" aria-pressed="${s.part===id}"`,'part-tab')).join('')}</div><div class="discovery"><h3>${D.parts[s.part].name}</h3><p>${D.parts[s.part].hint}</p></div><p class="tiny">El núcleo también es un orgánulo. Aquí lo estudiamos por separado.</p>`:`<h3>Tu mesa de laboratorio</h3><p>Observa las continuidades de la membrana, el núcleo y los orgánulos.</p>${s.peek?`<div class="reference-model">${img(s.model.id,'Modelo de referencia completo')}</div>`:'<div class="reference-placeholder">¿Necesitas mirar el modelo?</div>'}<div class="puzzle-tools">${button(s.peek?'Ocultar modelo':'Mirar el modelo','peek','data-focus="peek"','btn secondary small')}${button('Encajar una pieza','hint','data-focus="hint"','plain')}</div><p class="tiny">Las piezas se intercambian: ninguna desaparece.</p>`}</aside></div>`;
      s.actions=()=>s.solved?`<div class="action-row"><div class="next-side">${button(s.round===3?'Ver resultado':'Otro modelo','next','data-focus="next"')}</div></div>`:'';
      s.drop=(source,target)=>exchange(Number(source),Number(target));
      s.handle=(action,id)=>{
        if(action==='piece'&&!s.solved){const i=Number(id);if(s.selected===null){s.selected=i;draw('piece-'+i);}else if(s.selected===i){s.selected=null;draw('piece-'+i);}else exchange(s.selected,i);}
        else if(action==='peek'&&!s.solved){s.peek=!s.peek;if(s.peek)s.helps++;draw();}
        else if(action==='hint'&&!s.solved){const i=s.order.findIndex((v,j)=>v!==j);s.helps++;exchange(i,s.order.indexOf(i));}
        else if(action==='part'&&s.solved){s.part=id;draw();announce(D.parts[id].hint);}
        else if(action==='next'&&s.solved){if(s.round===3)finish(s);else{s.round++;prepare();draw();}}
      };
      s.summary=()=>`Has reconstruido cuatro modelos con ${s.moves} intercambios y ${s.helps} ayudas.`;
      return s;
    }

    function memory(meta){
      const s=baseState(meta,6),pairs=C.shuffle(D.pairs).slice(0,6);
      s.cards=C.shuffle(pairs.flatMap(p=>[{pair:p.id,type:'term',text:p.term},{pair:p.id,type:'definition',text:p.definition}]));
      s.open=[];s.found=new Set();s.turns=0;s.busy=false;s.timer=null;s.scoreLabel='parejas encontradas';
      s.view=()=>`<div class="activity-top"><span>Memoria y significado</span><span>${s.found.size} de 6 parejas</span></div><h2 class="question">¿Dónde estaba su pareja?</h2><p class="instruction">Destapa dos cartas. Cada palabra se empareja con su definición. Recuerda dónde están las que vuelven a ocultarse.</p>${stats([[s.turns,'turnos'],[s.found.size,'parejas encontradas']])}<div class="memory-grid">${s.cards.map((c,i)=>{const visible=s.open.includes(i)||s.found.has(c.pair);return button(`<span class="card-back" aria-hidden="true">✦<small>LABORATORIO VIVO</small></span><span class="card-front">${visible?`<span class="memory-kind">${c.type==='term'?'Palabra':'Definición'}</span><span>${esc(c.text)}</span>`:''}</span>`,'flip',`data-id="${i}" data-focus="card-${i}" aria-label="Carta ${i+1}${visible?': '+esc(c.text):', boca abajo'}" ${s.found.has(c.pair)?'disabled':''}`,'memory-card '+(visible?'face-up ':'')+(s.found.has(c.pair)?'paired':''));}).join('')}</div>`;
      s.actions=()=>s.found.size===6?`<div class="action-row"><span class="completion-inline">✓ Todas las ideas tienen su pareja.</span>${button('Ver resultado','finish','data-focus="next"')}</div>`:'';
      s.handle=(action,id)=>{
        if(action==='finish'&&s.found.size===6){finish(s);return;}
        if(action!=='flip'||s.busy)return;const i=Number(id),card=s.cards[i];
        if(!card||s.open.includes(i)||s.found.has(card.pair))return;
        s.open.push(i);s.feedback=null;
        if(s.open.length===2){s.turns++;const a=s.cards[s.open[0]],b=s.cards[s.open[1]];
          if(a.pair===b.pair&&a.type!==b.type){s.found.add(a.pair);const p=pairs.find(p=>p.id===a.pair);mark(s,a.pair,true,p.term,p.why);s.open=[];inform(s,true,p.why);}
          else{s.busy=true;s.timer=setTimeout(()=>{s.open=[];s.busy=false;s.timer=null;draw();announce('Las cartas se han vuelto a ocultar. Prueba otra pareja.');},1250);}
        }
        draw();
      };
      s.suspend=()=>{clearTimeout(s.timer);s.timer=null;if(s.busy){s.open=[];s.busy=false;}};
      s.resume=()=>draw();
      s.destroy=()=>clearTimeout(s.timer);
      s.summary=()=>`Has encontrado las seis parejas en ${s.turns} turnos.`;
      return s;
    }

    const pipeLevels=[
      {title:'Haz llegar los nutrientes',cargo:'Nutrientes',path:[10,11,6,7,8,13,14],nodes:[{at:11,id:'digestivo'},{at:8,id:'circulatorio'},{at:14,id:'celulas'}],start:'Alimentos',why:'El digestivo transforma los alimentos y absorbe nutrientes. El circulatorio los transporta hasta las células.'},
      {title:'Lleva oxígeno a las células',cargo:'Oxígeno',path:[10,5,6,1,2,3,8,13,14],nodes:[{at:6,id:'respiratorio'},{at:13,id:'circulatorio'},{at:14,id:'celulas'}],start:'Aire',why:'El respiratorio toma oxígeno. Este pasa a la sangre y el circulatorio lo lleva a las células.'},
      {title:'Elimina desechos con la orina',cargo:'Desechos celulares',path:[10,11,6,7,8,13,14],nodes:[{at:11,id:'circulatorio'},{at:8,id:'excretor'},{at:14,id:'exterior'}],start:'Células',why:'El circulatorio recoge desechos celulares. El excretor los elimina al exterior mediante la orina.'},
      {title:'Elimina el dióxido de carbono',cargo:'Dióxido de carbono',path:[10,15,16,21,22,23,18,13,14],nodes:[{at:16,id:'circulatorio'},{at:18,id:'respiratorio'},{at:14,id:'exterior'}],start:'Células',why:'El circulatorio recoge dióxido de carbono de las células y lo lleva al respiratorio, que lo expulsa con el aire.'}
    ];
    function pipes(meta){
      const s=baseState(meta,4);s.round=0;s.rotations=0;s.tests=0;s.scoreLabel='circuitos sin ayuda';
      function prepare(){s.level=pipeLevels[s.round];s.tiles=M.pipeBoard(s.level.path);s.flow=null;s.hintAt=null;s.solved=false;s.feedback=null;}
      prepare();
      function pipeSvg(tile){const xy=[[50,0],[100,50],[50,100],[0,50]],ps=M.ports(tile);const d=ps.map(p=>`M50 50L${xy[p].join(' ')}`).join('');return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${d}" class="pipe-wall"/><path d="${d}" class="pipe-channel"/></svg>`;}
      function flowSvg(){if(!s.flow?.visited.length)return '';const path=`M0 250 `+s.flow.visited.map(i=>`L${(i%5)*100+50} ${Math.floor(i/5)*100+50}`).join(' ')+(s.flow.ok?'L500 250':'');return `<svg class="pipe-overlay" viewBox="0 0 500 500" aria-hidden="true"><path d="${path}" fill="none" stroke="#00a7bd" stroke-width="8" opacity=".55"/><circle r="7" fill="#fff" stroke="#087d83" stroke-width="3">${matchMedia('(prefers-reduced-motion: reduce)').matches?`<set attributeName="visibility" to="hidden"/>`:`<animateMotion dur="${Math.max(1.2,s.flow.visited.length*.22)}s" repeatCount="indefinite" path="${path}"/>`}</circle></svg>`;}
      s.view=()=>`<div class="activity-top"><span>Circuito ${s.round+1} de 4</span><span class="cargo">${s.level.cargo}</span></div><h2 class="question">${s.level.title}.</h2><p class="instruction">Gira las tuberías para conectar la entrada de la izquierda con la salida de la derecha. El flujo debe pasar por los tres puntos, en el orden de la leyenda.</p><div class="pipes-layout"><div><div class="pipe-labels"><span>Entrada: ${s.level.start} · fila 3</span><span>Salida · fila 3</span></div><div class="pipe-board"><span class="pipe-port pipe-in" aria-hidden="true">→</span><span class="pipe-port pipe-out" aria-hidden="true">→</span><div class="pipe-grid">${s.tiles.map((tile,i)=>{const node=s.level.nodes.find(n=>n.at===i),station=node&&D.stations.find(a=>a.id===node.id),num=s.level.nodes.indexOf(node)+1;return button(`${pipeSvg(tile)}${node?`<span class="pipe-station">${station.image?img(station.image,''):'↗'}<b>${num}</b></span>`:''}`,'rotate',`data-id="${i}" data-focus="pipe-${i}" aria-label="Tubería fila ${Math.floor(i/5)+1}, columna ${i%5+1}${i===10?', entrada':i===14?', salida':''}${node?', punto '+num+': '+station.name:''}. Aberturas: ${M.ports(tile).map(p=>['arriba','derecha','abajo','izquierda'][p]).join(' y ')}. Girar." ${s.solved?'disabled':''}`,'pipe-tile '+(s.flow?.visited.includes(i)?'flowing ':'')+(s.flow&&!s.flow.ok&&s.flow.stop===i?'blocked ':'')+(s.hintAt===i?'hinted':''));}).join('')}</div>${flowSvg()}</div><p class="tiny">Es un circuito de funciones, no un dibujo de las conexiones anatómicas.</p></div><aside class="pipe-controls"><h3>La ruta que necesitamos</h3><ol class="pipe-legend">${s.level.nodes.map((n,i)=>{const a=D.stations.find(a=>a.id===n.id);return `<li><b>${i+1}</b>${a.image?img(a.image,''):''}<span>${a.name}</span></li>`;}).join('')}</ol>${stats([[s.rotations,'giros'],[s.tests,'pruebas de flujo']])}<div class="pipe-tools">${!s.solved?button('Soltar el flujo','run-flow','data-focus="run-flow"')+button('Señalar una tubería','hint','data-focus="hint"','plain'):''}</div></aside></div>`;
      s.actions=()=>s.solved?`<div class="action-row"><span class="completion-inline">✓ La sustancia llega a su destino.</span>${button(s.round===3?'Ver resultado':'Siguiente circuito','next','data-focus="next"')}</div>`:'';
      s.handle=(action,id)=>{
        if(action==='rotate'&&!s.solved){s.tiles[Number(id)].rotation=(s.tiles[Number(id)].rotation+1)%4;s.rotations++;s.flow=null;s.hintAt=null;s.feedback=null;draw('pipe-'+id);}
        else if(action==='run-flow'&&!s.solved){s.tests++;s.flow=M.trace(s.tiles,5,10,14,s.level.nodes.map(n=>n.at));s.solved=s.flow.ok;if(s.solved)mark(s,'pipe'+s.round,true,s.level.title,s.level.why);inform(s,s.solved,s.solved?s.level.why:s.flow.reason==='stations'?'La salida está conectada, pero la sustancia debe pasar por los tres puntos en el orden indicado.':'El flujo se ha detenido. Las aberturas de dos tuberías vecinas deben encontrarse. Revisa el tramo marcado en naranja.');draw(s.solved?'next':'run-flow');}
        else if(action==='hint'&&!s.solved){const i=s.level.path.find(i=>M.ports(s.tiles[i]).sort().join()!==[...s.tiles[i].ports].sort().join());s.hintAt=i;mark(s,'pipe'+s.round,false,s.level.title,s.level.why);inform(s,false,i===undefined?'Las tuberías de la ruta están orientadas. Suelta el flujo para comprobar.':`Prueba a girar la tubería de la fila ${Math.floor(i/5)+1}, columna ${i%5+1}. Piensa por dónde entra y por dónde debe salir.`);draw();}
        else if(action==='next'&&s.solved){if(s.round===3)finish(s);else{s.round++;prepare();draw();}}
      };
      s.summary=()=>`Has conectado cuatro circuitos con ${s.rotations} giros y ${s.tests} pruebas de flujo.`;
      return s;
    }

    const neuralMessages=[
      ['Los ojos detectan el estímulo','La pelota se acerca. Los ojos captan la información visual.'],
      ['Los nervios llevan la información','La información viaja por los nervios hacia el sistema nervioso central.'],
      ['El encéfalo coordina la respuesta','El encéfalo interpreta la información y envía órdenes por los nervios.'],
      ['Los músculos ejecutan el movimiento','Los músculos se contraen y mueven los huesos con ayuda de las articulaciones.']
    ];
    function arcade(meta){
      const s=baseState(meta,5);s.scoreLabel='pelotas al primer intento';s.hand=50;s.index=0;s.catches=0;s.retries=0;s.mode='practice';s.running=false;s.paused=false;s.started=false;s.raf=0;s.keys=new Set();s.phase=0;s.ball={x:50,y:6,vx:0,speed:15};s.outcome=null;
      function setupBall(){const x=s.index===0&&s.retries===0?50:18+Math.random()*64;s.ball={x,y:6,vx:s.mode==='challenge'?(Math.random()<.5?-9:9):0,speed:s.mode==='challenge'?27:15};s.phase=0;s.started=false;s.running=false;s.paused=false;s.outcome=null;s.feedback=null;}
      function paint(){
        const shell=getShell();if(!shell)return;
        const ball=shell.querySelector('.arcade-ball'),hand=shell.querySelector('.arcade-hand'),arm=shell.querySelector('.player-arm'),range=shell.querySelector('[data-hand-range]');
        if(ball){ball.style.left=s.ball.x+'%';ball.style.top=s.ball.y+'%';}
        if(hand)hand.style.left=s.hand+'%';if(arm)arm.setAttribute('d',`M50 94 Q${s.hand} 94 ${s.hand} 81`);
        if(range)range.value=s.hand;
        const phase=shell.querySelector('.neural-caption');if(phase){phase.querySelector('strong').textContent=neuralMessages[s.phase][0];phase.querySelector('span').textContent=neuralMessages[s.phase][1];}
        shell.querySelectorAll('.neural-stop').forEach((el,i)=>el.classList.toggle('lit',i<=s.phase));
        const position=shell.querySelector('.ball-position');if(position)position.textContent=`Pelota: ${Math.round(s.ball.x)} de 100 · mano: ${Math.round(s.hand)} de 100`;
      }
      function stop(){s.running=false;cancelAnimationFrame(s.raf);s.keys.clear();}
      function settle(outcome){stop();s.outcome=outcome;s.paused=false;if(outcome==='caught'){mark(s,'ball'+s.index,true,'La cadena de la función de relación',neuralMessages[3][1]);s.catches++;s.index++;inform(s,true,neuralMessages[(s.catches-1)%4][1]);}else{s.retries++;mark(s,'ball'+s.index,false,'La respuesta del cuerpo',neuralMessages[2][1]);inform(s,false,'La pelota ha pasado. Puedes volver a intentarlo. Los músculos ejecutan la respuesta que coordina el sistema nervioso.');}draw();}
      function tick(now){
        if(!s.running)return;const dt=Math.min((now-s.last)/1000,.05);s.last=now;
        const dir=(s.keys.has('ArrowRight')?1:0)-(s.keys.has('ArrowLeft')?1:0);s.hand=Math.max(8,Math.min(92,s.hand+dir*62*dt));
        s.ball=M.advanceBall(s.ball,dt);const phase=Math.min(3,Math.floor(s.ball.y/20));if(phase!==s.phase){s.phase=phase;announce(neuralMessages[phase][0]);}paint();
        const result=M.catchBall(s.ball,s.hand);if(result!=='flying'){settle(result);return;}s.raf=requestAnimationFrame(tick);
      }
      function run(){s.started=true;s.running=true;s.paused=false;s.feedback=null;s.last=performance.now();draw();s.raf=requestAnimationFrame(tick);announce(`La pelota está en la posición ${Math.round(s.ball.x)} de 100. Mueve la mano para cogerla.`);}
      function move(value){s.hand=Math.max(8,Math.min(92,value));paint();}
      s.view=()=>`<div class="activity-top"><span>Pelotas ${s.catches} / 5</span><span class="mini-badge">Arcade de coordinación</span></div><h2 class="question">Mueve la mano. ¡Atrapa la pelota!</h2><p class="instruction">Arrastra la mano por la pista, pulsa ← y → o usa los controles inferiores. Colócala debajo de la pelota cuando llegue a la franja verde.</p><div class="arcade-layout"><div><div class="arcade-field ${s.paused?'is-paused':''}" data-arcade-field tabindex="0" role="group" aria-label="Pista de pelota. Flechas izquierda y derecha para mover la mano; espacio para pausar."><div class="catch-lane" aria-hidden="true"></div><div class="court-line" aria-hidden="true"></div><svg class="arcade-player" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="player-arm" d="M50 94 Q50 94 50 81"/><path d="M44 100L45 95Q50 92 55 95L56 100" fill="#087d83"/><circle cx="50" cy="91.2" r="4.2" fill="#ddb68b"/><circle cx="48.5" cy="90.7" r=".35"/><circle cx="51.5" cy="90.7" r=".35"/></svg><div class="arcade-ball" aria-hidden="true"></div><div class="arcade-hand" aria-hidden="true"><span>✋</span></div>${s.paused?'<div class="pause-overlay">En pausa</div>':''}${!s.started&&!s.outcome?'<div class="court-ready">Observa → decide → mueve</div>':''}</div><p class="ball-position tiny" aria-live="off"></p><label class="hand-range-label" for="hand-range">Posición de la mano</label><input id="hand-range" data-hand-range type="range" min="8" max="92" value="${s.hand}" aria-label="Posición de la mano, de 8 a 92"><div class="arcade-controls">${button('←','left','aria-label="Mover la mano a la izquierda"','btn secondary')}${button(s.running?'Pausar':s.paused?'Reanudar':'Pausa','pause',`${s.started&&!s.outcome?'':'disabled'} data-focus="pause"`,'btn secondary')}${button('→','right','aria-label="Mover la mano a la derecha"','btn secondary')}</div></div><aside class="arcade-dashboard"><div class="mode-selector" role="group" aria-label="Velocidad de juego">${button('Entrenamiento','mode','data-id="practice" data-focus="mode-practice" aria-pressed="'+(s.mode==='practice')+'" '+(s.started&&!s.outcome?'disabled':''),'')}${button('Reto','mode','data-id="challenge" data-focus="mode-challenge" aria-pressed="'+(s.mode==='challenge')+'" '+(s.started&&!s.outcome?'disabled':''),'')}</div><div class="neural-track">${['Ojos','Nervios','Encéfalo','Músculos'].map((t,i)=>`<div class="neural-stop"><b>${i+1}</b>${t}</div>`).join('')}</div><div class="neural-caption"><strong></strong><span></span></div>${stats([[s.catches,'pelotas atrapadas'],[s.retries,'reintentos']])}<p class="tiny">El juego ralentiza la secuencia para estudiarla. En la realidad, la respuesta ocurre mucho más rápido.</p></aside></div>`;
      s.actions=()=>`<div class="action-row"><span class="tiny">Puedes pausar cuando quieras. La pestaña oculta pausa el juego.</span><div class="next-side">${s.catches===5?button('Ver resultado','finish','data-focus="next"'):!s.running&&!s.paused?button(s.outcome==='caught'?'Siguiente pelota':s.outcome==='missed'?'Volver a intentarlo':'Soltar pelota','launch','data-focus="launch"'):''}</div></div>`;
      s.mount=paint;
      s.handle=(action,id)=>{
        if(action==='left')move(s.hand-8);else if(action==='right')move(s.hand+8);
        else if(action==='mode'&&(!s.started||s.outcome)){s.mode=id;draw();}
        else if(action==='launch'&&!s.running&&s.catches<5){if(s.outcome)setupBall();else{s.ball.speed=s.mode==='challenge'?27:15;s.ball.vx=s.mode==='challenge'?9:0;}run();}
        else if(action==='pause'&&s.started&&!s.outcome){if(s.running){stop();s.paused=true;draw();}else if(s.paused)run();}
        else if(action==='finish'&&s.catches===5)finish(s);
      };
      s.input=el=>{if(el.matches('[data-hand-range]'))move(Number(el.value));};
      s.pointer=el=>{const r=getShell()?.querySelector('[data-arcade-field]')?.getBoundingClientRect();if(r)move((el.clientX-r.left)/r.width*100);};
      s.keydown=e=>{
        if(e.target.matches('input,select,textarea')||e.ctrlKey||e.metaKey||e.altKey)return;
        if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();s.keys.add(e.key);if(!s.running)move(s.hand+(e.key==='ArrowLeft'?-5:5));}
        else if(e.code==='Space'&&e.target.matches('[data-arcade-field]')){e.preventDefault();s.handle(s.started&&!s.outcome?'pause':'launch');}
      };
      s.keyup=e=>s.keys.delete(e.key);
      const onVisibility=()=>{if(document.hidden&&s.running){stop();s.paused=true;draw();announce('Juego en pausa. Pulsa Reanudar para continuar.');}};
      document.addEventListener('visibilitychange',onVisibility);
      s.suspend=()=>{stop();if(s.started&&!s.outcome)s.paused=true;};
      s.resume=()=>draw();
      s.destroy=()=>{stop();document.removeEventListener('visibilitychange',onVisibility);};
      s.summary=()=>`Has atrapado cinco pelotas y practicado la cadena ojos → nervios → encéfalo → músculos. Reintentos: ${s.retries}.`;
      return s;
    }

    const searchClues=[
      {word:'UNICELULAR',clue:'Ser vivo formado por una sola célula.'},
      {word:'PLURICELULAR',clue:'Ser vivo formado por muchas células que colaboran.'},
      {word:'AMEBA',clue:'Ejemplo de organismo unicelular que has visto en el tema.'},
      {word:'NEURONA',clue:'Célula especializada en transmitir información.'},
      {word:'CELULA',display:'CÉLULA',clue:'Unidad básica de los seres vivos.'},
      {word:'TEJIDO',clue:'Conjunto de células organizadas que colaboran en una función.'},
      {word:'ORGANO',display:'ÓRGANO',clue:'Estructura formada por varios tejidos que trabajan juntos.'},
      {word:'PERSONA',clue:'Ejemplo de organismo pluricelular humano.'}
    ];
    function wordSearch(meta){
      const s=baseState(meta,8);s.puzzle=M.wordSearch(searchClues.map(w=>w.word));s.found=new Map();s.start=null;s.preview=[];s.hintAt=null;s.helps=0;s.scoreLabel='palabras encontradas';s.focus=0;
      function selectPath(a,b){
        const line=M.line(a,b,12);s.start=null;s.preview=line;s.hintAt=null;
        if(!line.length){inform(s,false,'Traza una línea recta: horizontal, vertical o diagonal.');draw();return;}
        const letters=line.map(i=>s.puzzle.grid[i]).join(''),entry=searchClues.find(w=>w.word===letters||w.word===[...letters].reverse().join(''));
        if(entry){if(s.found.has(entry.word))inform(s,false,'Esa palabra ya está encontrada. Busca otra definición.');else{s.found.set(entry.word,line);mark(s,entry.word,true,entry.display||entry.word,entry.clue);inform(s,true,`${entry.display||entry.word}: ${entry.clue}`);}}
        else inform(s,false,`«${letters}» no corresponde a una de estas definiciones. Busca otra línea.`);
        draw();
      }
      s.view=()=>{const foundCells=new Set([...s.found.values()].flat());return `<div class="activity-top"><span>Ocho conceptos escondidos</span><span>${s.found.size} / 8 encontrados</span></div><h2 class="question">Lee la pista. Encuentra la palabra.</h2><p class="instruction">Arrastra desde la primera letra hasta la última, o toca esas dos letras. Las palabras pueden ir en horizontal, vertical o diagonal, en ambos sentidos.</p><div class="search-layout"><div><div class="word-search-wrap"><div class="word-search-grid" role="group" aria-label="Sopa de letras de 12 filas y 12 columnas">${s.puzzle.grid.map((letter,i)=>button(letter,'search-cell',`data-id="${i}" data-search-cell="${i}" data-focus="search-${i}" tabindex="${s.focus===i?0:-1}" aria-label="Fila ${Math.floor(i/12)+1}, columna ${i%12+1}: ${letter}${foundCells.has(i)?', encontrada':''}" aria-pressed="${s.start===i}"`,'search-cell '+(foundCells.has(i)?'found ':'')+(s.preview.includes(i)?'preview ':'')+(s.start===i?'start ':'')+(s.hintAt===i?'hinted':''))).join('')}</div></div><p class="tiny">Con teclado: usa las flechas para desplazarte y Enter para marcar el inicio y el final. Las tildes se omiten en la cuadrícula.</p>${button('Pista: primera letra','hint','data-focus="hint"','btn secondary small')}</div><aside><h3>¿Qué conceptos buscamos?</h3><ol class="search-clues">${searchClues.map((w,i)=>`<li class="${s.found.has(w.word)?'found':''}"><span>${s.found.has(w.word)?'✓':i+1}</span><div>${s.found.has(w.word)?`<strong>${w.display||w.word}</strong>`:''}${w.clue}</div></li>`).join('')}</ol></aside></div>`;};
      s.actions=()=>s.found.size===8?`<div class="action-row"><span class="completion-inline">✓ Los ocho conceptos están localizados.</span>${button('Ver resultado','finish','data-focus="next"')}</div>`:'';
      s.searchPath=selectPath;
      s.searchPreview=(a,b)=>{const cells=M.line(a,b,12);getShell()?.querySelectorAll('[data-search-cell]').forEach(el=>el.classList.toggle('drag-preview',cells.includes(Number(el.dataset.searchCell))));};
      s.handle=(action,id)=>{
        if(action==='search-cell'){const i=Number(id);s.focus=i;if(s.start===null){s.start=i;s.preview=[];s.feedback=null;draw('search-'+i);}else if(s.start===i){s.start=null;draw('search-'+i);}else selectPath(s.start,i);}
        else if(action==='hint'){const w=searchClues.find(w=>!s.found.has(w.word));if(!w)return;s.helps++;s.hintAt=s.puzzle.words[w.word][0];inform(s,true,`La palabra de la pista «${w.clue}» empieza por ${w.word[0]}, en la fila ${Math.floor(s.hintAt/12)+1}, columna ${s.hintAt%12+1}.`);draw();}
        else if(action==='finish'&&s.found.size===8)finish(s);
      };
      s.keydown=e=>{if(!e.target.matches('[data-search-cell]'))return;const i=Number(e.target.dataset.searchCell),r=Math.floor(i/12),c=i%12;let next=i;if(e.key==='ArrowRight')next=r*12+Math.min(11,c+1);else if(e.key==='ArrowLeft')next=r*12+Math.max(0,c-1);else if(e.key==='ArrowDown')next=Math.min(11,r+1)*12+c;else if(e.key==='ArrowUp')next=Math.max(0,r-1)*12+c;else return;e.preventDefault();s.focus=next;getShell().querySelectorAll('[data-search-cell]').forEach(el=>el.tabIndex=Number(el.dataset.searchCell)===next?0:-1);getShell().querySelector(`[data-search-cell="${next}"]`).focus({preventScroll:true});};
      s.summary=()=>`Has relacionado las ocho definiciones con sus palabras. Pistas usadas: ${s.helps}.`;
      return s;
    }

    const wordGroups=[
      [
        {word:'CÉLULA',clue:'Es la unidad básica de los seres vivos.'},
        {word:'NÚCLEO',clue:'Contiene el ADN y las instrucciones para el funcionamiento celular.'},
        {word:'MEMBRANA',clue:'Envuelve la célula y regula el intercambio con el exterior.'},
        {word:'CITOPLASMA',clue:'Es el medio interior donde se encuentran los orgánulos.'}
      ],[
        {word:'TEJIDO',clue:'Es un conjunto de células organizadas que colaboran en una función.'},
        {word:'ÓRGANO',clue:'Está formado por varios tejidos que trabajan juntos.'},
        {word:'UNICELULAR',clue:'Así es un ser vivo formado por una sola célula.'}
      ],[
        {word:'NUTRICIÓN',clue:'Función que permite obtener materia y energía y eliminar desechos.'},
        {word:'RELACIÓN',clue:'Función que permite captar información y elaborar respuestas.'},
        {word:'CIGOTO',clue:'Célula nueva que se forma cuando se unen el espermatozoide y el óvulo.'},
        {word:'PARTO',clue:'Salida del bebé al exterior del cuerpo de la madre.'},
        {word:'SEXUAL',clue:'Tipo de reproducción en el que se unen dos células sexuales.'}
      ]
    ];
    function biole(meta){
      const s=baseState(meta,3);s.words=C.shuffle(wordGroups.map(g=>C.shuffle(g)[0]));s.round=0;s.totalGuesses=0;s.scoreLabel='palabras resueltas';
      function prepare(){s.q=s.words[s.round];s.target=M.clean(s.q.word);s.guesses=[];s.complete=false;s.won=false;s.feedback=null;s.extraHint=false;s.draft='';}
      prepare();
      function submit(){
        if(s.complete)return;const input=getShell().querySelector('#bio-input'),guess=M.clean(input.value);s.draft=input.value;
        if(!/^[A-Z]+$/.test(guess)||guess.length!==s.target.length){inform(s,false,`Escribe exactamente ${s.target.length} letras. Puedes omitir las tildes.`);draw('bio-input');return;}
        if(s.guesses.some(g=>g.word===guess)){inform(s,false,'Ya has probado esa palabra. Usa las pistas de las letras para cambiarla.');draw('bio-input');return;}
        s.draft='';const feedback=M.wordFeedback(s.target,guess);s.guesses.push({word:guess,feedback});s.totalGuesses++;s.won=guess===s.target;s.complete=s.won||s.guesses.length===6;
        if(s.complete){mark(s,'word'+s.round,s.won,s.q.word,s.q.clue);inform(s,s.won,s.won?`¡Palabra descubierta! ${s.q.word}: ${s.q.clue}`:`La palabra era ${s.q.word}. ${s.q.clue}`);}else{inform(s,true,'Observa las letras: ✓ está en su sitio; ↔ está en otra posición; − no aparece, o ya has usado todas sus repeticiones.');}
        draw(s.complete?'next':'bio-input');
      }
      s.view=()=>{
        const keyState={},rank={absent:1,present:2,exact:3};for(const g of s.guesses)for(let i=0;i<g.word.length;i++)if((rank[g.feedback[i]]||0)>(rank[keyState[g.word[i]]]||0))keyState[g.word[i]]=g.feedback[i];
        const rows=Array.from({length:6},(_,i)=>{const g=s.guesses[i];return `<div class="bio-row" role="group" aria-label="${g?'Intento '+(i+1)+': '+[...g.word].map((l,j)=>l+', '+({exact:'en su lugar',present:'en otro lugar',absent:'sin más apariciones'})[g.feedback[j]]).join('; '):'Intento '+(i+1)+', vacío'}">${Array.from({length:s.target.length},(_,j)=>`<span class="bio-letter ${g?g.feedback[j]:''}" aria-hidden="true">${g?g.word[j]:''}${g?`<small>${({exact:'✓',present:'↔',absent:'−'})[g.feedback[j]]}</small>`:''}</span>`).join('')}</div>`;}).join('');
        return `<div class="activity-top"><span>Palabra ${s.round+1} de 3</span><span>${s.target.length} letras · seis intentos</span></div><h2 class="question">Biole: descifra el concepto.</h2><p class="bio-clue">${s.q.clue}</p><div class="bio-board" style="--word-length:${s.target.length}">${rows}</div><div class="bio-legend"><span><b class="exact">✓</b>Letra y lugar</span><span><b class="present">↔</b>En otro lugar</span><span><b class="absent">−</b>Sin más apariciones</span></div>${!s.complete?`<div class="bio-entry"><label for="bio-input">Tu palabra de ${s.target.length} letras</label><div><input id="bio-input" data-focus="bio-input" type="text" value="${esc(s.draft)}" maxlength="${s.target.length}" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="bio-entry-help"><button type="button" class="btn" data-action="submit-word">Probar</button></div><p id="bio-entry-help" class="tiny">Escribe con tu teclado o usa las letras de abajo. Las tildes son opcionales.</p></div><div class="bio-keyboard" aria-label="Teclado de letras">${['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map(row=>`<div>${[...row].map(l=>button(l,'letter',`data-id="${l}" aria-label="Letra ${l}"`,'bio-key '+(keyState[l]||''))).join('')}</div>`).join('')}<div>${button('⌫ Borrar','erase','','bio-key wide')}${button('Probar palabra','submit-word','','bio-key wide enter')}</div></div>${button(s.extraHint?'Primera letra: '+s.target[0]:'Pista extra','hint','data-focus="hint"','plain')}`:''}`;
      };
      s.actions=()=>s.complete?`<div class="action-row"><div class="next-side">${button(s.round===2?'Ver resultado':'Otra palabra','next','data-focus="next"')}</div></div>`:'';
      s.handle=(action,id)=>{
        if(action==='submit-word')submit();
        else if(action==='letter'&&!s.complete){const input=getShell().querySelector('#bio-input');if(input.value.length<s.target.length)input.value+=id;s.draft=input.value;}
        else if(action==='erase'&&!s.complete){const input=getShell().querySelector('#bio-input');input.value=input.value.slice(0,-1);s.draft=input.value;}
        else if(action==='hint'&&!s.complete){s.extraHint=true;draw();announce('La primera letra es '+s.target[0]);}
        else if(action==='next'&&s.complete){if(s.round===2)finish(s);else{s.round++;prepare();draw();}}
      };
      s.input=el=>{if(el.id==='bio-input')s.draft=el.value;};
      s.keydown=e=>{if(e.key==='Enter'&&e.target.id==='bio-input'){e.preventDefault();submit();}};
      s.summary=()=>`Has practicado tres conceptos en ${s.totalGuesses} intentos. Cada palabra admite hasta seis pruebas.`;
      return s;
    }

    function bind(getActive){
      let drag=null,ghost=null,blockedClickUntil=0;
      const cleanup=()=>{ghost?.remove();ghost=null;document.querySelectorAll('.drop-hover,.drag-preview').forEach(el=>el.classList.remove('drop-hover','drag-preview'));drag=null;};
      document.addEventListener('pointerdown',e=>{
        const active=getActive();if(!active||active.finished||e.button!==0)return;
        const grab=e.target.closest('[data-grab-value]'),cell=e.target.closest('[data-search-cell]'),field=e.target.closest('[data-arcade-field]');
        if(grab&&!grab.disabled)drag={kind:'piece',source:grab.dataset.grabValue,el:grab,x:e.clientX,y:e.clientY,moved:false};
        else if(cell)drag={kind:'search',source:Number(cell.dataset.searchCell),el:cell,x:e.clientX,y:e.clientY,moved:false};
        else if(field&&active.pointer){drag={kind:'arcade',x:e.clientX,y:e.clientY,moved:false};active.pointer(e);field.focus({preventScroll:true});}
      });
      document.addEventListener('pointermove',e=>{
        if(!drag)return;const active=getActive();if(!active||active.finished){cleanup();return;}
        if(drag.kind==='arcade'){active.pointer?.(e);return;}
        if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<7&&!drag.moved)return;
        drag.moved=true;e.preventDefault();
        if(drag.kind==='piece'){
          if(!ghost){ghost=drag.el.cloneNode(true);ghost.removeAttribute('id');ghost.setAttribute('aria-hidden','true');ghost.tabIndex=-1;ghost.classList.add('drag-ghost');const r=drag.el.getBoundingClientRect();ghost.style.width=r.width+'px';ghost.style.height=r.height+'px';document.body.append(ghost);}
          ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';
          document.querySelectorAll('.drop-hover').forEach(el=>el.classList.remove('drop-hover'));document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]')?.classList.add('drop-hover');
        }else{const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-search-cell]');if(target)active.searchPreview?.(drag.source,Number(target.dataset.searchCell));}
      },{passive:false});
      document.addEventListener('pointerup',e=>{
        if(!drag)return;const active=getActive(),saved=drag;
        if(saved.moved){blockedClickUntil=Date.now()+350;const selector=saved.kind==='piece'?'[data-drop]':'[data-search-cell]',target=document.elementFromPoint(e.clientX,e.clientY)?.closest(selector);cleanup();if(target&&active&&!active.finished){if(saved.kind==='piece')active.drop?.(saved.source,target.dataset.drop);else active.searchPath?.(saved.source,Number(target.dataset.searchCell));}}
        else cleanup();
      });
      document.addEventListener('pointercancel',cleanup);
      document.addEventListener('click',e=>{if(Date.now()<blockedClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
      document.addEventListener('keydown',e=>{const s=getActive();if(s&&!s.finished)s.keydown?.(e);});
      document.addEventListener('keyup',e=>getActive()?.keyup?.(e));
      document.addEventListener('input',e=>{const s=getActive();if(s&&!s.finished)s.input?.(e.target);});
      window.addEventListener('blur',()=>getActive()?.keys?.clear());
      window.addEventListener('pagehide',e=>{cleanup();const s=getActive();if(e.persisted)s?.suspend?.();else s?.destroy?.();});
      window.addEventListener('pageshow',e=>{if(e.persisted){const s=getActive();if(s&&!s.finished)s.resume?.();}});
    }
    return {factories:{celulas:puzzle,parejas:memory,nutricion:pipes,relacion:arcade,clasificar:wordSearch,reto:biole},bind};
  }
  root.LVGames={create};
})(globalThis);
