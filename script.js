const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');
let w, h, nodes = [];
const NODE_COUNT = 46;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize(){
  w = canvas.width = canvas.offsetWidth;
  h = canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resize);
resize();

function initNodes(){
  nodes = [];
  for(let i=0;i<NODE_COUNT;i++){
    nodes.push({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*0.18,
      vy: (Math.random()-0.5)*0.18,
      r: Math.random()*1.6+1.2,
      pulse: Math.random()*Math.PI*2
    });
  }
}
initNodes();

let scanY = 0;

function draw(){
  ctx.clearRect(0,0,w,h);

  // base grid (topographic-style)
  ctx.strokeStyle = 'rgba(95,212,208,0.05)';
  ctx.lineWidth = 1;
  const gap = 56;
  for(let x=0;x<w;x+=gap){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0;y<h;y+=gap){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

  // connections
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const a = nodes[i], b = nodes[j];
      const dx = a.x-b.x, dy = a.y-b.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist < 150){
        ctx.strokeStyle = `rgba(95,212,208,${0.14*(1-dist/150)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
  }

  // nodes
  nodes.forEach(n=>{
    n.pulse += 0.02;
    const glow = (Math.sin(n.pulse)+1)/2;
    ctx.beginPath();
    ctx.fillStyle = `rgba(232,148,75,${0.5+glow*0.5})`;
    ctx.arc(n.x, n.y, n.r + glow*0.8, 0, Math.PI*2);
    ctx.fill();

    if(!reduceMotion){
      n.x += n.vx; n.y += n.vy;
      if(n.x<0||n.x>w) n.vx*=-1;
      if(n.y<0||n.y>h) n.vy*=-1;
    }
  });

  // scanning line
  if(!reduceMotion){
    ctx.strokeStyle = 'rgba(95,212,208,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(w, scanY);
    ctx.stroke();
    const grad = ctx.createLinearGradient(0,scanY-40,0,scanY);
    grad.addColorStop(0,'rgba(95,212,208,0)');
    grad.addColorStop(1,'rgba(95,212,208,0.08)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY-40, w, 40);
    scanY += 0.6;
    if(scanY > h) scanY = 0;
  }

  requestAnimationFrame(draw);
}
draw();

// ===== AI visual nodes =====
const aiVisual = document.getElementById('ai-visual');
const aiNodePositions = [
  [15,20],[40,12],[68,25],[85,18],[25,55],[55,48],[78,60],[10,80],[45,82],[70,88],[60,68],[33,30]
];
aiNodePositions.forEach((pos,i)=>{
  const dot = document.createElement('div');
  dot.className = 'ai-node ai-pulse';
  dot.style.left = pos[0]+'%';
  dot.style.top = pos[1]+'%';
  dot.style.animationDelay = (i*0.3)+'s';
  aiVisual.appendChild(dot);
});
// connecting lines via SVG overlay
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS,"svg");
svg.setAttribute("style","position:absolute;inset:0;width:100%;height:100%;");
aiVisual.appendChild(svg);
function connectAINodes(){
  svg.innerHTML = '';
  for(let i=0;i<aiNodePositions.length;i++){
    for(let j=i+1;j<aiNodePositions.length;j++){
      const [x1,y1] = aiNodePositions[i];
      const [x2,y2] = aiNodePositions[j];
      const dx=x1-x2, dy=y1-y2;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist < 35){
        const line = document.createElementNS(svgNS,"line");
        line.setAttribute("x1", x1+"%"); line.setAttribute("y1", y1+"%");
        line.setAttribute("x2", x2+"%"); line.setAttribute("y2", y2+"%");
        line.setAttribute("stroke","rgba(95,212,208,0.18)");
        line.setAttribute("stroke-width","1");
        svg.appendChild(line);
      }
    }
  }
}
connectAINodes();
