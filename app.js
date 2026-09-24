(function(){
  // Slant each word on its own so wrapped headlines stay aligned
  document.querySelectorAll('.sk').forEach(function(sk){
    var w=document.createTreeWalker(sk,NodeFilter.SHOW_TEXT),nodes=[];
    while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(function(t){
      var frag=document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(function(part){
        if(!part)return;
        if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(' '));return}
        var s=document.createElement('span');s.className='skw';s.textContent=part;frag.appendChild(s);
      });
      t.parentNode.replaceChild(frag,t);
    });
    sk.classList.add('sk-split');
  });

  // Countdown to Episode 1 game day (target date; kickoff time TBD)
  var target=new Date('2026-10-10T12:00:00-04:00').getTime();
  var cd=document.getElementById('cd');
  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    var ms=Math.max(0,target-Date.now());
    var d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4);
    cd.querySelector('[data-u=d]').textContent=d;
    cd.querySelector('[data-u=h]').textContent=pad(h);
    cd.querySelector('[data-u=m]').textContent=pad(m);
  }
  tick();setInterval(tick,30000);

  // Map
  var svg=document.getElementById('map');
  if(svg&&window.GEO){
    var S={CMH:[1229.9,509.3,'COLUMBUS','l'],GVL:[1261.2,641.3,'GREENVILLE','l'],ATH:[1243.4,667.5,'ATHENS','l'],HFD:[1419.8,424.3,'HARTFORD','r'],STR:[1427.5,420.9,'STORRS','r'],PGF:[1233.5,619.9,'PIGEON FORGE','l'],SLR:[1283.0,471.9,'SLIPPERY ROCK','r'],MGW:[1291.3,508.7,'MORGANTOWN','r'],SHV:[1022.0,722.4,'SHREVEPORT','r'],MOW:[1111.9,530.6,'MOWEAQUA','l'],STL:[1090.0,558.5,'ST. LOUIS','l']};
    var ns='http://www.w3.org/2000/svg';
    function el(t,a){var e=document.createElementNS(ns,t);for(var k in a)e.setAttribute(k,a[k]);svg.appendChild(e);return e}
    el('path',{d:GEO.nation,fill:'#15171B',stroke:'#3a3d44','stroke-width':2});
    el('path',{d:GEO.states,fill:'none',stroke:'#26292f','stroke-width':1.2});
    // season line
    var l1=el('path',{d:'M1229.9,509.3 C1275,560 1275,610 1261.2,641.3 Q1236,650 1243.4,667.5',fill:'none',stroke:'#FFC20E','stroke-width':7,'stroke-linecap':'round'});
    var l2=el('path',{d:'M1243.4,667.5 C1330,600 1380,500 1419.8,424.3',fill:'none',stroke:'#FFC20E','stroke-width':6,'stroke-dasharray':'22 14',opacity:.85});
    var l3=el('path',{d:'M1419.8,424.3 C1200,330 900,420 760,560',fill:'none',stroke:'#9A9CA0','stroke-width':4,'stroke-dasharray':'6 14','stroke-linecap':'round',opacity:.6});
    [['M1283.0,471.9 Q1296,490 1291.3,508.7 C1200,560 1080,640 1022.0,722.4',6],['M1111.9,530.6 Q1100,548 1090.0,558.5',6]].forEach(function(a){el('path',{d:a[0],fill:'none',stroke:'#FFC20E','stroke-width':a[1],'stroke-dasharray':'22 14',opacity:.85})});
    el('text',{x:790,y:520,class:'map-lbl',fill:'#9A9CA0'}).textContent='NEXT STOP?';
    Object.keys(S).forEach(function(k){
      var s=S[k];
      el('circle',{cx:s[0],cy:s[1],r:16,fill:'rgba(255,194,14,.18)'});
      el('circle',{cx:s[0],cy:s[1],r:7,fill:'#FFC20E',stroke:'#0B0C0E','stroke-width':3});
      var t=el('text',{x:s[3]=='l'?s[0]-24:s[0]+22,y:s[1]+({STR:-12,HFD:22,GVL:-2,CMH:8,PGF:-10,SLR:-6,MGW:14,SHV:8,MOW:-8,STL:22}[k]!==undefined?{STR:-12,HFD:22,GVL:-2,CMH:8,PGF:-10,SLR:-6,MGW:14,SHV:8,MOW:-8,STL:22}[k]:22),class:'map-lbl','text-anchor':s[3]=='l'?'end':'start'});
      t.textContent=s[2];
    });
    // draw-on animation
    [l1,l3].forEach(function(p){var L=p.getTotalLength();if(p===l3)return;p.style.strokeDasharray=L;p.style.strokeDashoffset=L;p.style.transition='stroke-dashoffset 1.4s ease';p.dataset.draw=1});
    var mo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){svg.querySelectorAll('[data-draw]').forEach(function(p){p.style.strokeDashoffset=0});mo.disconnect()}})},{threshold:.3});
    mo.observe(svg);
  }

  // Reveal on scroll
  var items=document.querySelectorAll('.sec-head,.lane,.ep,.stat,.set-grid figure,.song,.form,.stops li');
  items.forEach(function(e){e.classList.add('reveal')});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  items.forEach(function(e){io.observe(e)});

  // Host form (front-end only for now)
  var f=document.getElementById('hostForm'),err=document.getElementById('formErr');
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var bad=[];
    ['name','org','email','city'].forEach(function(n){
      var i=f.elements[n],ok=i.value.trim()!==''&&(n!=='email'||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim()));
      i.setAttribute('aria-invalid',ok?'false':'true');if(!ok)bad.push(i);
    });
    if(bad.length){err.textContent='Please fill in your name, organization, a valid email and your city.';bad[0].focus();return}
    err.textContent='';
    document.getElementById('okCity').textContent=f.elements.city.value.trim();
    document.getElementById('formOk').hidden=false;
  });
})();
