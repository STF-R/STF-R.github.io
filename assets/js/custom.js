(function(){
  'use strict';

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

/* V19 — active section state based on document boundaries, with end-of-page Contact handling. */
(function(){
  'use strict';
  var links=Array.prototype.slice.call(document.querySelectorAll('.floating-nav-panel a[href^="#"]'));
  var items=links.map(function(link){
    var section=document.querySelector(link.getAttribute('href'));
    return section ? {link:link,section:section} : null;
  }).filter(Boolean);
  if(!items.length)return;
  var ticking=false;
  function updateActive(){
    ticking=false;
    /* A stable reading line below the floating navigation. Absolute document
       offsets avoid the ambiguity caused by very tall sections such as Expertises. */
    var readingY=window.scrollY+Math.min(Math.max(window.innerHeight*.28,120),240);
    var active=items[0];

    /* The final Contact section cannot always reach the reading line because the
       document ends first. When the viewport is effectively at the bottom, make
       the last section active explicitly. The small tolerance absorbs fractional
       pixels and mobile browser chrome without changing any earlier thresholds. */
    var atPageEnd=(window.scrollY+window.innerHeight)>=document.documentElement.scrollHeight-8;
    if(atPageEnd){
      active=items[items.length-1];
    } else {
    for(var i=0;i<items.length;i++){
      var top=items[i].section.getBoundingClientRect().top+window.scrollY;
      var nextTop=(i+1<items.length)
        ? items[i+1].section.getBoundingClientRect().top+window.scrollY
        : Number.POSITIVE_INFINITY;
      if(readingY>=top && readingY<nextTop){active=items[i];break;}
      if(readingY>=top)active=items[i];
    }
    }
    links.forEach(function(link){
      var on=link===active.link;
      if(on)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
      link.classList.toggle('is-active',on);
    });
  }
  function requestUpdate(){
    if(!ticking){ticking=true;requestAnimationFrame(updateActive);}
  }
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  addEventListener('load',updateActive,{once:true});
  updateActive();
})();
