/* ===========================================================
   JOYOUS MINERAL — interaction layer
   =========================================================== */
(function(){
  "use strict";

  document.getElementById('yearNow').textContent = new Date().getFullYear();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- header scroll state ---------------- */
  var header = document.getElementById('site-header');
  function onScrollHeader(){
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive:true });

  /* mobile menu */
  var menuToggle = document.getElementById('menuToggle');
  menuToggle.addEventListener('click', function(){
    document.body.classList.toggle('menu-open');
  });
  document.querySelectorAll('#site-nav a').forEach(function(a){
    a.addEventListener('click', function(){ document.body.classList.remove('menu-open'); });
  });

  /* ---------------- hero load sequence ---------------- */
  function runHeroIntro(){
    var words = document.querySelectorAll('#heroHeadline .word span');
    var sub = document.getElementById('heroSub');
    var actions = document.getElementById('heroActions');

    if (reduceMotion || !window.gsap){
      words.forEach(function(w){ w.style.transform = 'none'; });
      sub.style.opacity = 1; sub.style.transform = 'none';
      actions.style.opacity = 1; actions.style.transform = 'none';
      return;
    }
    var tl = gsap.timeline({ delay:.3 });
    tl.to(words, { y:'0%', duration:1.1, stagger:.12, ease:'power4.out' })
      .to(sub, { opacity:1, y:0, duration:.9, ease:'power2.out' }, '-=.55')
      .to(actions, { opacity:1, y:0, duration:.9, ease:'power2.out' }, '-=.6');

    // slow ken-burns on hero image
    gsap.to('#heroImg', { scale:1.0, duration:16, ease:'none' });
  }
  runHeroIntro();

  /* hero parallax on scroll */
  if (window.gsap && window.ScrollTrigger && !reduceMotion){
    gsap.to('#heroImg', {
      scale:1.24, yPercent:6,
      scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:true }
    });
    gsap.to('#heroHeadline, .hero-sub, .hero-actions', {
      yPercent:-18, opacity:.4,
      scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:true }
    });
  }

  /* floating dust particles in hero */
  (function initParticles(){
    var host = document.getElementById('heroParticles');
    var count = window.innerWidth < 700 ? 10 : 22;
    for (var i=0;i<count;i++){
      var p = document.createElement('span');
      p.className = 'particle';
      var left = Math.random()*100;
      var delay = Math.random()*10;
      var dur = 9 + Math.random()*10;
      var size = 2 + Math.random()*3;
      p.style.left = left + '%';
      p.style.width = size+'px'; p.style.height = size+'px';
      p.style.animation = 'floatUp ' + dur + 's linear ' + delay + 's infinite';
      host.appendChild(p);
    }
    var styleTag = document.createElement('style');
    styleTag.textContent = '@keyframes floatUp{0%{ transform:translateY(0) translateX(0); opacity:0; } 8%{opacity:.55;} 92%{opacity:.3;} 100%{ transform:translateY(-100vh) translateX(30px); opacity:0; } }';
    document.head.appendChild(styleTag);
  })();

  /* ---------------- generic reveal-on-scroll ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:.18, rootMargin:'0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* section labels / headings fade-in via ScrollTrigger (subtle, once) */
  if (window.gsap && window.ScrollTrigger && !reduceMotion){
    document.querySelectorAll('section h2, section .label').forEach(function(el){
      gsap.from(el, {
        opacity:0, y:24, duration:.9, ease:'power2.out',
        scrollTrigger:{ trigger:el, start:'top 88%' }
      });
    });
  }

  /* ---------------- source route line draw ---------------- */
  (function initRoute(){
    var path = document.getElementById('routePath');
    var nodes = document.querySelectorAll('#routeGrid .node');
    if (!path) return;
    function activate(){
      var rect = path.closest('.route').getBoundingClientRect();
      var vh = window.innerHeight;
      var progress = Math.min(1, Math.max(0, (vh*0.85 - rect.top) / (rect.height + vh*0.4)));
      var total = 2100;
      path.style.strokeDashoffset = String(total * (1-progress));
      var activeCount = Math.round(progress * nodes.length);
      nodes.forEach(function(n, idx){
        n.classList.toggle('active', idx < activeCount);
      });
    }
    path.style.strokeDasharray = '2100';
    path.style.strokeDashoffset = '2100';
    window.addEventListener('scroll', activate, { passive:true });
    window.addEventListener('resize', activate);
    activate();
  })();

  /* ---------------- sticky process section ---------------- */
  (function initProcess(){
    var steps = document.querySelectorAll('.proc-step');
    var imgs = document.querySelectorAll('.proc-img');
    var indexNum = document.getElementById('procIndexNum');
    var bar = document.getElementById('procBar');
    if (!steps.length) return;

    function setActive(n){
      steps.forEach(function(s){ s.classList.toggle('active', s.dataset.step === String(n)); });
      imgs.forEach(function(im){ im.classList.toggle('active', im.dataset.img === String(n)); });
      indexNum.textContent = ('0'+n).slice(-2) + ' / 05';
      bar.style.width = (n/5*100) + '%';
    }

    if (window.gsap && window.ScrollTrigger){
      steps.forEach(function(step){
        ScrollTrigger.create({
          trigger: step,
          start: 'top center',
          end: 'bottom center',
          onEnter: function(){ setActive(step.dataset.step); },
          onEnterBack: function(){ setActive(step.dataset.step); }
        });
      });
    } else {
      window.addEventListener('scroll', function(){
        var mid = window.innerHeight/2;
        steps.forEach(function(step){
          var r = step.getBoundingClientRect();
          if (r.top < mid && r.bottom > mid) setActive(step.dataset.step);
        });
      }, { passive:true });
    }
  })();

  /* ---------------- pipeline stage open/close ---------------- */
  (function initPipeline(){
    var stages = document.querySelectorAll('.pipeline .stage');
    stages.forEach(function(st){
      st.addEventListener('mouseenter', function(){
        if (window.innerWidth <= 860) return;
        stages.forEach(function(s){ s.classList.remove('open'); });
        st.classList.add('open');
      });
      st.addEventListener('click', function(){
        stages.forEach(function(s){ s.classList.remove('open'); });
        st.classList.add('open');
      });
    });
  })();

  /* ---------------- grain size scale animate ---------------- */
  (function initGrainScale(){
    var scale = document.getElementById('grainScale');
    if (!scale) return;
    var nums = scale.querySelectorAll('.gnum');
    var idx = 0;
    function highlightNext(){
      nums.forEach(function(n){ n.classList.remove('hi'); });
      nums[idx].classList.add('hi');
      idx = (idx+1) % nums.length;
    }
    var started = false;
    function maybeStart(){
      var r = scale.getBoundingClientRect();
      if (!started && r.top < window.innerHeight*0.85){
        started = true;
        highlightNext();
        setInterval(highlightNext, 1400);
      }
    }
    window.addEventListener('scroll', maybeStart, { passive:true });
    maybeStart();
  })();

  /* ---------------- quality rings ---------------- */
  (function initQualityRings(){
    var rings = document.querySelectorAll('.qcard .ring-fg');
    if (!rings.length) return;
    var done = false;
    function activate(){
      var host = document.getElementById('qualityGrid');
      var r = host.getBoundingClientRect();
      if (!done && r.top < window.innerHeight*0.82){
        done = true;
        rings.forEach(function(ring, i){
          setTimeout(function(){ ring.style.strokeDashoffset = '18'; }, i*130);
        });
      }
    }
    window.addEventListener('scroll', activate, { passive:true });
    activate();
  })();

  /* ---------------- contact form: floating labels + live validation ---------------- */
  (function initForm(){
    var form = document.getElementById('contact-form');
    if (!form) return;
    var fields = form.querySelectorAll('.field');
    var status = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');

    var validators = {
      name: function(v){ return v.trim().length >= 2 ? '' : 'Please enter your full name.'; },
      phone: function(v){ return /^[0-9+\-\s()]{7,16}$/.test(v.trim()) ? '' : 'Enter a valid phone number.'; },
      email: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.'; },
      message: function(v){ return v.trim().length >= 10 ? '' : 'Tell us a little more (min. 10 characters).'; }
    };

    fields.forEach(function(field){
      var input = field.querySelector('input, textarea');
      var errEl = field.querySelector('.ferr');
      var type = field.dataset.type;

      function sync(showError){
        var v = input.value;
        field.classList.toggle('filled', v.length > 0);
        var msg = validators[type] ? validators[type](v) : '';
        if (v.length === 0){
          field.classList.remove('error','valid');
          errEl.textContent = '';
          return;
        }
        if (msg){
          field.classList.add('error');
          field.classList.remove('valid');
          errEl.textContent = showError ? msg : '';
        } else {
          field.classList.remove('error');
          field.classList.add('valid');
          errEl.textContent = '';
        }
      }

      input.addEventListener('input', function(){ sync(false); });
      input.addEventListener('blur', function(){ sync(true); });
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();

      // honeypot
      if (form.company_website.value){ return; }

      var valid = true;
      var firstInvalid = null;
      fields.forEach(function(field){
        var input = field.querySelector('input, textarea');
        var type = field.dataset.type;
        var msg = validators[type] ? validators[type](input.value) : '';
        var errEl = field.querySelector('.ferr');
        if (msg){
          valid = false;
          field.classList.add('error');
          field.classList.remove('valid');
          errEl.textContent = msg;
          if (!firstInvalid) firstInvalid = input;
        } else {
          field.classList.add('filled');
        }
      });

      if (!valid){
        status.textContent = 'Please fix the highlighted fields.';
        status.className = 'form-status bad';
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      status.textContent = '';
      status.className = 'form-status';

      var data = new FormData(form);

      fetch('contact.php', { method:'POST', body:data, headers:{ 'X-Requested-With':'XMLHttpRequest' } })
        .then(function(res){ return res.json().catch(function(){ return { success:false, message:'Unexpected server response.' }; }); })
        .then(function(json){
          if (json.success){
            status.textContent = json.message || 'Message sent — thank you. We will get back to you shortly.';
            status.className = 'form-status ok';
            form.reset();
            fields.forEach(function(f){ f.classList.remove('filled','valid','error'); });
          } else {
            status.textContent = json.message || 'Something went wrong. Please call us directly instead.';
            status.className = 'form-status bad';
          }
        })
        .catch(function(){
          status.textContent = 'Could not send right now. Please call +91 63544 00553 or email us directly.';
          status.className = 'form-status bad';
        })
        .finally(function(){
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        });
    });
  })();

})();
