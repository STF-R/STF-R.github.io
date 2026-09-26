(function(){
  'use strict';

  /* Subtle animated data layer. */
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
      nodes.forEach(function(n){var ny=waveY(n.x,n.band,n.phase)+Math.sin(time*1.8+n.phase)*5,pulse=.65+.35*Math.sin(time*2.3+n.phase);ctx.beginPath();ctx.arc(n.x,ny,n.r*pulse,0,Math.PI*2);ctx.fillStyle='rgba(142,205,255,'+(n.alpha*pulse)+')';ctx.fill();});
      streams.forEach(function(s){s.x+=s.speed;if(s.x>w+30)s.x=-30;var y=waveY(s.x,s.band,s.phase),tail=26+s.speed*35,grad=ctx.createLinearGradient(s.x-tail,y,s.x,y);if(s.warm){grad.addColorStop(0,'rgba(235,159,74,0)');grad.addColorStop(1,'rgba(255,188,92,'+s.alpha+')');}else{grad.addColorStop(0,'rgba(111,190,255,0)');grad.addColorStop(1,'rgba(158,218,255,'+s.alpha+')');}ctx.beginPath();ctx.moveTo(s.x-tail,waveY(s.x-tail,s.band,s.phase));ctx.lineTo(s.x,y);ctx.strokeStyle=grad;ctx.lineWidth=s.size;ctx.stroke();ctx.beginPath();ctx.arc(s.x,y,s.size*1.25,0,Math.PI*2);ctx.fillStyle=s.warm?'rgba(255,194,104,'+s.alpha+')':'rgba(181,228,255,'+s.alpha+')';ctx.fill();});
      var cx=w*.5,cy=h*.5,pulse=.055+.025*Math.sin(time*2.2),g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(w,h)*.20);g.addColorStop(0,'rgba(240,166,82,'+pulse+')');g.addColorStop(.35,'rgba(116,190,246,'+(pulse*.35)+')');g.addColorStop(1,'rgba(20,70,120,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      requestAnimationFrame(draw);
    }
    addEventListener('resize',reset,{passive:true});reset();requestAnimationFrame(draw);
  }

  /* Persistent navigation: kept outside #wrapper so position:fixed is viewport-based. */
  var primaryNav=document.getElementById('nav');
  var floating=document.querySelector('.floating-nav');
  if(floating){
    var toggle=floating.querySelector('.floating-nav-toggle');
    var navThreshold=0;

    function updateThreshold(){
      /* Absolute document position of the bottom of the primary navigation. */
      if(primaryNav){
        var rect=primaryNav.getBoundingClientRect();
        navThreshold=window.scrollY+rect.bottom;
      }else{
        var hero=document.querySelector('.cinematic-hero');
        navThreshold=hero ? hero.offsetTop+hero.offsetHeight : 80;
      }
    }

    function closeFloating(){
      floating.classList.remove('is-open');
      if(toggle)toggle.setAttribute('aria-expanded','false');
    }

    function setFloating(){
      var show=document.body.classList.contains('about-corporate') || window.scrollY>Math.max(80,navThreshold-12);
      floating.classList.toggle('is-visible',show);
      if(!show)closeFloating();
    }

    if(toggle)toggle.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      var open=floating.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded',String(open));
    });

    floating.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',closeFloating);
    });

    document.addEventListener('click',function(e){
      if(!floating.contains(e.target))closeFloating();
    });

    addEventListener('scroll',setFloating,{passive:true});
    addEventListener('resize',function(){updateThreshold();setFloating();},{passive:true});
    addEventListener('load',function(){updateThreshold();setFloating();},{once:true});
    updateThreshold();
    setFloating();
  }

  /* Formspree AJAX with native HTML POST fallback if JavaScript is unavailable. */
  document.querySelectorAll('.contact-form').forEach(function(form){
    form.addEventListener('submit',async function(e){
      e.preventDefault();
      var success=form.querySelector('.form-status:not(.error)'),error=form.querySelector('.form-status.error'),button=form.querySelector('[type="submit"]');
      if(success){success.textContent='Envoi en cours…';success.classList.remove('success');}
      if(error)error.textContent='';
      if(button)button.disabled=true;
      try{
        var response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}});
        if(!response.ok){var detail='';try{var data=await response.json();detail=data.error||'';}catch(ignore){}throw new Error(detail||('HTTP '+response.status));}
        form.reset();
        if(success){success.classList.add('success');success.textContent='Message envoyé. Merci, nous revenons vers vous rapidement.';}
      }catch(err){
        if(success)success.textContent='';
        if(error)error.textContent='Le message n’a pas pu être envoyé. Vous pouvez écrire directement à sr@paradigm-ai.fr.';
        console.error('Formspree submission failed:',err);
      }finally{if(button)button.disabled=false;}
    });
  });
})();

/* V15 — active section state for the persistent navigation. */
(function(){
  'use strict';
  if(!('IntersectionObserver' in window)) return;
  var links=Array.prototype.slice.call(document.querySelectorAll('.floating-nav-panel a[href^="#"]'));
  if(!links.length) return;
  var map={};
  links.forEach(function(link){var id=link.getAttribute('href').slice(1);if(id)map[id]=link;});
  var sections=Object.keys(map).map(function(id){return document.getElementById(id);}).filter(Boolean);
  var observer=new IntersectionObserver(function(entries){
    var visible=entries.filter(function(e){return e.isIntersecting;}).sort(function(a,b){return b.intersectionRatio-a.intersectionRatio;});
    if(!visible.length)return;
    links.forEach(function(link){link.removeAttribute('aria-current');});
    var active=map[visible[0].target.id];
    if(active)active.setAttribute('aria-current','true');
  },{rootMargin:'-18% 0px -62% 0px',threshold:[0,.15,.35,.6]});
  sections.forEach(function(section){observer.observe(section);});
})();
