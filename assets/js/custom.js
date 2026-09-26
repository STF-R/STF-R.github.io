(function(){
  'use strict';
  var canvas=document.getElementById('data-flow');
  if(canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var ctx=canvas.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1,2), w=0,h=0,t=0, particles=[];
    function resize(){w=window.innerWidth;h=window.innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);particles=[];var n=Math.max(24,Math.min(60,Math.round(w/28)));for(var i=0;i<n;i++)particles.push({x:Math.random()*w,y:h*(.34+Math.random()*.32),v:.15+Math.random()*.35,r:.5+Math.random()*1.25,a:.15+Math.random()*.42,phase:Math.random()*6.28});}
    function frame(){t+=.006;ctx.clearRect(0,0,w,h);for(var i=0;i<particles.length;i++){var p=particles[i];p.x+=p.v;if(p.x>w+10)p.x=-10;var y=p.y+Math.sin(t*3+p.phase+p.x*.006)*8;ctx.beginPath();ctx.arc(p.x,y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(126,198,255,'+(p.a*(.72+.28*Math.sin(t*5+p.phase)))+')';ctx.fill();if(i%5===0){ctx.beginPath();ctx.moveTo(p.x-18,y);ctx.lineTo(p.x,y);ctx.strokeStyle='rgba(255,176,78,'+(p.a*.22)+')';ctx.lineWidth=.7;ctx.stroke();}}
      var cx=w*.5,cy=h*.5,g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(w,h)*.18);g.addColorStop(0,'rgba(255,173,70,'+(.045+.025*Math.sin(t*4))+')');g.addColorStop(1,'rgba(255,173,70,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);requestAnimationFrame(frame);}
    window.addEventListener('resize',resize,{passive:true});resize();requestAnimationFrame(frame);
  }
  document.querySelectorAll('.contact-form').forEach(function(form){form.addEventListener('submit',async function(e){e.preventDefault();var status=form.querySelector('.form-status'),button=form.querySelector('[type="submit"]');status.className='form-status';status.textContent='Envoi en cours…';button.disabled=true;try{var r=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});if(!r.ok)throw new Error('send');form.reset();status.classList.add('success');status.textContent='Message envoyé. Merci, nous revenons vers vous rapidement.';}catch(err){status.classList.add('error');status.textContent='Le message n’a pas pu être envoyé. Vous pouvez écrire directement à sr@paradigm-ai.fr.';}finally{button.disabled=false;}});});
})();
