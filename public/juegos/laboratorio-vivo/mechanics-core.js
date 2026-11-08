(function(root){
  'use strict';
  const clean=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();
  function wordFeedback(target,guess){
    target=clean(target);guess=clean(guess);
    if(target.length!==guess.length)return [];
    const result=Array(target.length).fill('absent'),left={};
    for(let i=0;i<target.length;i++){
      if(guess[i]===target[i])result[i]='exact';
      else left[target[i]]=(left[target[i]]||0)+1;
    }
    for(let i=0;i<target.length;i++)if(result[i]!=='exact'&&left[guess[i]]>0){result[i]='present';left[guess[i]]--;}
    return result;
  }
  function swap(items,a,b){const next=[...items];if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=next.length||b>=next.length)return next;[next[a],next[b]]=[next[b],next[a]];return next;}
  function line(a,b,size){
    if(a<0||b<0||a>=size*size||b>=size*size)return [];
    const ar=Math.floor(a/size),ac=a%size,br=Math.floor(b/size),bc=b%size;
    const dr=br-ar,dc=bc-ac;if(dr&&dc&&Math.abs(dr)!==Math.abs(dc))return [];
    const count=Math.max(Math.abs(dr),Math.abs(dc))+1;
    return Array.from({length:count},(_,i)=>(ar+Math.sign(dr)*i)*size+ac+Math.sign(dc)*i);
  }
  function wordSearch(words,size=12,random=Math.random){
    const ordered=words.map(clean).sort((a,b)=>b.length-a.length),dirs=[[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]];
    if(ordered.some(w=>w.length>size))throw Error('La cuadrícula no puede contener esa palabra.');
    for(let round=0;round<40;round++){
      const grid=Array(size*size).fill(''),placements={};let failed=false;
      for(const word of ordered){
        let placed=false;
        for(let attempt=0;attempt<1200;attempt++){
          const row=Math.floor(random()*size),col=Math.floor(random()*size),[dr,dc]=dirs[Math.floor(random()*dirs.length)];
          const er=row+dr*(word.length-1),ec=col+dc*(word.length-1);
          if(er<0||er>=size||ec<0||ec>=size)continue;
          const cells=Array.from({length:word.length},(_,i)=>(row+dr*i)*size+col+dc*i);
          if(cells.some((p,i)=>grid[p]&&grid[p]!==word[i]))continue;
          cells.forEach((p,i)=>grid[p]=word[i]);placements[word]=cells;placed=true;break;
        }
        if(!placed){failed=true;break;}
      }
      if(failed)continue;
      const alphabet='ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
      return {size,grid:grid.map(c=>c||alphabet[Math.floor(random()*alphabet.length)]),words:placements};
    }
    throw Error('No se ha podido distribuir la sopa de letras.');
  }
  const directions=[[-1,0],[0,1],[1,0],[0,-1]];
  const ports=t=>t.ports.map(p=>(p+t.rotation+4)%4);
  function step(index,d,size){const r=Math.floor(index/size)+directions[d][0],c=index%size+directions[d][1];return r<0||r>=size||c<0||c>=size?-1:r*size+c;}
  function trace(tiles,size,start,end,required=[]){
    const visited=[],seen=new Set();let current=start,incoming=3;
    for(let count=0;count<=tiles.length;count++){
      if(current<0||!tiles[current]||seen.has(current))return {ok:false,visited,stop:current,reason:'loop'};
      const exits=ports(tiles[current]);
      if(!exits.includes(incoming))return {ok:false,visited,stop:current,reason:'connection'};
      visited.push(current);seen.add(current);
      const out=exits.find(p=>p!==incoming),next=step(current,out,size);
      if(current===end&&out===1){
        let cursor=-1;const ordered=required.every(id=>{cursor=visited.indexOf(id,cursor+1);return cursor>=0;});
        return {ok:ordered,visited,stop:current,reason:ordered?'complete':'stations'};
      }
      if(next<0||!ports(tiles[next]).includes((out+2)%4))return {ok:false,visited,stop:current,reason:'connection'};
      incoming=(out+2)%4;current=next;
    }
    return {ok:false,visited,stop:current,reason:'loop'};
  }
  function pipeBoard(path,size=5,random=Math.random){
    const tiles=Array.from({length:size*size},()=>({ports:random()<.5?[0,2]:[0,1],rotation:Math.floor(random()*4)}));
    const dir=(a,b)=>directions.findIndex(([dr,dc])=>Math.floor(a/size)+dr===Math.floor(b/size)&&a%size+dc===b%size);
    path.forEach((id,i)=>{tiles[id]={ports:[i?dir(id,path[i-1]):3,i<path.length-1?dir(id,path[i+1]):1],rotation:Math.floor(random()*4)};});
    if(trace(tiles,size,path[0],path.at(-1)).ok)tiles[path[0]].rotation=(tiles[path[0]].rotation+1)%4;
    return tiles;
  }
  function advanceBall(ball,dt){
    const next={...ball};next.y+=ball.speed*Math.max(0,dt);next.x+=ball.vx*Math.max(0,dt);
    while(next.x<5||next.x>95){if(next.x<5){next.x=10-next.x;next.vx=Math.abs(next.vx);}else{next.x=190-next.x;next.vx=-Math.abs(next.vx);}}
    return next;
  }
  function catchBall(ball,hand){return ball.y>=76&&ball.y<=85&&Math.abs(ball.x-hand)<=12?'caught':ball.y>92?'missed':'flying';}
  const api={clean,wordFeedback,swap,line,wordSearch,ports,trace,pipeBoard,advanceBall,catchBall};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LVMechanics=api;
})(typeof globalThis!=='undefined'?globalThis:this);
