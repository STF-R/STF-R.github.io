(function(){
  'use strict';

  /* Restrained ambient light layer. The background image now carries the main motion. */
  var canvas=document.getElementById('data-flow');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(canvas && !reduced){
    var ctx=canvas.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2),w=0,h=0,t=0,lights=[];
    function reset(){
      w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
      lights=[];
      var count=w<737?5:9;
      for(var i=0;i<count;i++)lights.push({x:Math.random()*w,y:Math.random()*h,r:1+Math.random()*1.8,a:.035+Math.random()*.055,p:Math.random()*6.283});
    }
    function draw(){
      t+=.006;ctx.clearRect(0,0,w,h);
      lights.forEach(function(n){
        var pulse=.55+.45*Math.sin(t+n.p);
        ctx.beginPath();ctx.arc(n.x,n.y,n.r*(.85+pulse*.25),0,Math.PI*2);
        ctx.fillStyle='rgba(178,222,255,'+(n.a*pulse)+')';ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    addEventListener('resize',reset,{passive:true});reset();requestAnimationFrame(draw);
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
