(function(){
  'use strict';

  /* Premium ambient data layer: slow cylindrical network ribbons.
     The motion is intentionally restrained so the content remains dominant. */
  var canvas=document.getElementById('data-flow');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(canvas && !reduced){
    var ctx=canvas.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2),w=0,h=0,last=0,time=0,ribbons=[],particles=[];

    function buildScene(){
      w=innerWidth;h=innerHeight;
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      canvas.style.width=w+'px';canvas.style.height=h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ribbons=[];particles=[];

      var mobile=w<737;
      var ribbonCount=mobile?3:5;
      for(var i=0;i<ribbonCount;i++){
        ribbons.push({
          centerY:h*(.18+i*(.64/Math.max(1,ribbonCount-1))),
          amplitude:(mobile?18:26)+i*3,
          wavelength:(mobile?250:330)+i*42,
          phase:i*1.37+Math.random()*.7,
          speed:(i%2?-1:1)*(.035+i*.006),
          alpha:(mobile?.055:.07)+(i%2)*.012,
          width:mobile?42:58
        });
      }

      var particleCount=mobile?18:Math.max(30,Math.min(54,Math.round(w/30)));
      for(var j=0;j<particleCount;j++){
        particles.push({
          ribbon:j%ribbonCount,
          t:Math.random(),
          speed:.012+Math.random()*.018,
          offset:(Math.random()-.5)*(mobile?30:44),
          radius:.55+Math.random()*1.15,
          alpha:.10+Math.random()*.18,
          warm:Math.random()>.91
        });
      }
    }

    function ribbonY(r,x,t){
      var angle=(x/r.wavelength)*Math.PI*2+r.phase+t*r.speed;
      /* Two harmonics suggest a surface rolling in depth rather than a flat wave. */
      return r.centerY+Math.sin(angle)*r.amplitude+Math.sin(angle*.5+r.phase)*r.amplitude*.24;
    }

    function drawRibbon(r,t){
      var step=w<737?34:26;
      ctx.save();
      ctx.lineCap='round';
      for(var band=-2;band<=2;band++){
        ctx.beginPath();
        for(var x=-step;x<=w+step;x+=step){
          var y=ribbonY(r,x,t)+band*(r.width/4);
          if(x===-step)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        var edge=1-Math.abs(band)/3;
        ctx.strokeStyle='rgba(128,194,239,'+(r.alpha*edge)+')';
        ctx.lineWidth=band===0?.85:.55;
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawParticles(dt,t){
      particles.forEach(function(p){
        p.t=(p.t+p.speed*dt)%1;
        var r=ribbons[p.ribbon],x=p.t*(w+120)-60;
        var y=ribbonY(r,x,t)+p.offset;
        var angle=(x/r.wavelength)*Math.PI*2+r.phase+t*r.speed;
        var depth=.42+.58*((Math.cos(angle)+1)/2);
        var a=p.alpha*depth;
        ctx.beginPath();ctx.arc(x,y,p.radius*(.7+depth*.55),0,Math.PI*2);
        ctx.fillStyle=p.warm?'rgba(238,171,91,'+a*.7+')':'rgba(166,218,252,'+a+')';ctx.fill();
      });
    }

    function draw(now){
      if(!last)last=now;
      var dt=Math.min((now-last)/1000,.05);last=now;time+=dt;
      ctx.clearRect(0,0,w,h);

      ribbons.forEach(function(r){drawRibbon(r,time);});
      drawParticles(dt,time);

      /* Very soft centre illumination ties the animated layer to the existing hero. */
      var glow=.032+.008*Math.sin(time*.45),cx=w*.52,cy=h*.46;
      var g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(w,h)*.38);
      g.addColorStop(0,'rgba(114,184,235,'+glow+')');
      g.addColorStop(.55,'rgba(74,139,194,'+(glow*.32)+')');
      g.addColorStop(1,'rgba(7,20,38,0)');
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      requestAnimationFrame(draw);
    }

    var resizeTimer;
    addEventListener('resize',function(){clearTimeout(resizeTimer);resizeTimer=setTimeout(buildScene,120);},{passive:true});
    document.addEventListener('visibilitychange',function(){if(!document.hidden)last=performance.now();});
    buildScene();requestAnimationFrame(draw);
  }

  /* Persistent navigation: kept outside #wrapper so position:fixed is viewport-based. */
  var primaryNav=document.getElementById('nav');
  var floating=document.querySelector('.floating-nav');
  if(primaryNav && floating){
    var toggle=floating.querySelector('.floating-nav-toggle');
    var navThreshold=0;

    function updateThreshold(){
      /* Absolute document position of the bottom of the primary navigation. */
      var rect=primaryNav.getBoundingClientRect();
      navThreshold=window.scrollY+rect.bottom;
    }

    function closeFloating(){
      floating.classList.remove('is-open');
      if(toggle)toggle.setAttribute('aria-expanded','false');
    }

    function setFloating(){
      var show=window.scrollY>Math.max(80,navThreshold-12);
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
