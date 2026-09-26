(function(){
  'use strict';
  var canvas=document.getElementById('data-flow');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(canvas && !reduced){
    var ctx=canvas.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2),w=0,h=0,time=0,streams=[],nodes=[];
    function waveY(x,band,phase){var base=band===0?h*.34:h*.66;return base+Math.sin(x*.006+phase)*22+Math.sin(x*.0025-phase*.7)*13;}
    function reset(){
      w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
      streams=[];nodes=[];
      var sn=Math.max(14,Math.min(30,Math.round(w/55))),nn=Math.max(18,Math.min(42,Math.round(w/38)));
      for(var i=0;i<sn;i++)streams.push({x:Math.random()*w,band:i%2,phase:Math.random()*6.28,speed:.22+Math.random()*.38,size:.7+Math.random()*1.5,warm:Math.random()>.72,alpha:.2+Math.random()*.38});
      for(var j=0;j<nn;j++)nodes.push({x:Math.random()*w,band:j%2,phase:Math.random()*6.28,r:.8+Math.random()*1.6,alpha:.12+Math.random()*.25});
    }
    function draw(){
      time+=.008;ctx.clearRect(0,0,w,h);
      for(var i=0;i<nodes.length;i++){var n=nodes[i],ny=waveY(n.x,n.band,n.phase)+Math.sin(time*1.8+n.phase)*5,pulse=.65+.35*Math.sin(time*2.3+n.phase);ctx.beginPath();ctx.arc(n.x,ny,n.r*pulse,0,Math.PI*2);ctx.fillStyle='rgba(142,205,255,'+(n.alpha*pulse)+')';ctx.fill();}
      for(var k=0;k<streams.length;k++){var s=streams[k];s.x+=s.speed;if(s.x>w+30)s.x=-30;var y=waveY(s.x,s.band,s.phase),tail=26+s.speed*35;var grad=ctx.createLinearGradient(s.x-tail,y,s.x,y);if(s.warm){grad.addColorStop(0,'rgba(235,159,74,0)');grad.addColorStop(1,'rgba(255,188,92,'+s.alpha+')');}else{grad.addColorStop(0,'rgba(111,190,255,0)');grad.addColorStop(1,'rgba(158,218,255,'+s.alpha+')');}ctx.beginPath();ctx.moveTo(s.x-tail,waveY(s.x-tail,s.band,s.phase));ctx.lineTo(s.x,y);ctx.strokeStyle=grad;ctx.lineWidth=s.size;ctx.stroke();ctx.beginPath();ctx.arc(s.x,y,s.size*1.25,0,Math.PI*2);ctx.fillStyle=s.warm?'rgba(255,194,104,'+s.alpha+')':'rgba(181,228,255,'+s.alpha+')';ctx.fill();}
      var cx=w*.5,cy=h*.5,pulse=.055+.025*Math.sin(time*2.2),g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(w,h)*.20);g.addColorStop(0,'rgba(240,166,82,'+pulse+')');g.addColorStop(.35,'rgba(116,190,246,'+(pulse*.35)+')');g.addColorStop(1,'rgba(20,70,120,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      requestAnimationFrame(draw);
    }
    addEventListener('resize',reset,{passive:true});reset();requestAnimationFrame(draw);
  }
  // Persistent navigation: appears after the page's primary navigation leaves the viewport.
  var primaryNav=document.getElementById('nav');
  if(primaryNav){
    var floating=document.createElement('div');
    floating.className='floating-nav';
    floating.setAttribute('aria-label','Navigation rapide');
    floating.innerHTML='<button class="floating-nav-toggle" type="button" aria-expanded="false" aria-label="Ouvrir le menu"><span></span><span></span><span></span></button><nav class="floating-nav-panel"><a href="index.html">Expertises</a><a href="thisisparadigmai.html">À propos</a><a href="index.html#contact">Contact</a></nav>';
    document.body.appendChild(floating);
    var toggle=floating.querySelector('.floating-nav-toggle');
    function setFloating(){
      var r=primaryNav.getBoundingClientRect();
      floating.classList.toggle('is-visible',r.bottom<12);
      if(r.bottom>=12){floating.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');}
    }
    toggle.addEventListener('click',function(){var open=floating.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});
    floating.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){floating.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');});});
    document.addEventListener('click',function(e){if(!floating.contains(e.target)){floating.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');}});
    addEventListener('scroll',setFloating,{passive:true});addEventListener('resize',setFloating,{passive:true});setFloating();
  }
})();
