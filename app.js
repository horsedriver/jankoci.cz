(() => {
  const clone = obj => JSON.parse(JSON.stringify(obj));
  const defaults = clone(window.CYBERCORE_DATA);
  const stored = localStorage.getItem('cybercore-career-data');
  let data = stored ? JSON.parse(stored) : clone(defaults);
  const qs = new URLSearchParams(location.search);
  const theme = qs.get('theme') || localStorage.getItem('cybercore-theme') || 'dark';
  document.body.dataset.theme = theme;
  const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24"><use href="#i-${name}"></use></svg>`;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const save = () => localStorage.setItem('cybercore-career-data', JSON.stringify(data));

  function sprite(){return `<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
    <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></symbol>
    <symbol id="i-linkedin" viewBox="0 0 24 24"><path d="M6 9v11M6 5v.1M10 20V9h4v2c1-2 6-2 6 3v6M10 14c0-3 4-4 4 0v6"/></symbol>
    <symbol id="i-github" viewBox="0 0 24 24"><path d="M9 19c-4 1-4-2-5-2m10 4v-3c0-1 .3-2-1-3 3 0 6-1 6-6a5 5 0 0 0-1-3 5 5 0 0 0 0-3s-1 0-3 2a11 11 0 0 0-6 0C7 3 6 3 6 3a5 5 0 0 0 0 3 5 5 0 0 0-1 3c0 5 3 6 6 6-1 1-1 2-1 3v3"/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></symbol>
  </svg>`}
  const contact = (i, html) => `<div class="contact-item">${icon(i)}${html}</div>`;
  const link = (url,label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;

  function page1(){
    const metrics = data.metrics.map(m=>`<div class="metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('');
    const pipeline = data.cybercore.pipeline.map((p,i)=>`<div class="pipe"><div class="pipe-icon">${['◌','▤','◇','⬡','⚙'][i]}</div><strong>${esc(p.title)}</strong><span>${esc(p.text)}</span></div>`).join('');
    return `<section class="page dark">
      ${sprite()}
      <div class="hero">
        <img class="portrait" src="assets/jan-koci-original.jpeg" alt="Jan Kočí">
        <div class="hero-copy">
          <div class="hero-top">
            <div><h1 class="name">${esc(data.profile.name).toUpperCase()}</h1><div class="role">${esc(data.profile.title).toUpperCase()}</div><div class="subtitle">${esc(data.profile.subtitle)}</div><p class="summary">${esc(data.profile.summary)}</p></div>
            <div class="brand-block"><img class="logo" src="assets/cybercore-logo.svg" alt="CyberCore logo"><h2>CYBERCORE</h2><p>${esc(data.cybercore.tagline)}</p></div>
          </div>
          <div class="contact-row">
            ${contact('mail',link('mailto:'+data.profile.email,data.profile.email))}
            ${contact('linkedin',link(data.profile.linkedinUrl,data.profile.linkedinLabel))}
            ${contact('pin',esc(data.profile.city))}
            ${contact('github',link(data.profile.githubUrl,data.profile.githubLabel))}
          </div>
          <div class="metrics">${metrics}</div>
        </div>
      </div>
      <div class="page1-body">
        <div class="product-grid">
          <div class="product-main">
            <div class="product-intro"><div><h2>${esc(data.cybercore.name)}</h2><p>${esc(data.cybercore.intro)}</p></div><div><h3 class="section-title">Core capabilities</h3><ul class="cap-list">${data.cybercore.capabilities.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>
            <div class="pipeline">${pipeline}</div><div class="principles">Traceable · Verifiable · Governed · Human approval before mutation</div>
            <h3 class="section-title" style="margin-top:4mm">Technology stack</h3><div class="stack">${data.technologies.slice(0,14).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
          </div>
          <div class="product-side">
            <div class="dark-card"><h3 class="section-title">Project status</h3><p class="status-text">${esc(data.cybercore.repositoryStatus)}</p><div class="qr-box"><a href="${esc(data.profile.githubUrl)}"><img class="qr" src="assets/github-cybercore-qr.png" alt="QR code to CyberCore GitHub"></a><div class="qr-copy"><strong>View on GitHub</strong><br>${link(data.profile.githubUrl,data.profile.githubLabel)}</div></div></div>
            <div class="dark-card"><h3 class="section-title">Professional focus</h3><div class="focus-grid">${data.expertise.map(x=>`<div class="focus">${esc(x)}</div>`).join('')}</div></div>
          </div>
        </div>
        <div class="cta"><div class="focus-card"><h3 class="section-title">Selected experience</h3><div class="focus-grid">${data.timeline.slice(0,4).map(x=>`<div class="focus"><strong>${esc(x.company)}</strong><br>${esc(x.role)}</div>`).join('')}</div></div><a class="cta-card" href="mailto:${esc(data.profile.email)}"><div><strong>LET'S BUILD EVIDENCE-DRIVEN INFRASTRUCTURE</strong><br><span>${esc(data.profile.availability)}</span></div><b>→</b></a></div>
      </div>
      <div class="footer-brand"><span>CyberCore</span><span>Evidence drives decisions · Governance enables automation · Humans keep control</span><span>${esc(data.profile.email)}</span></div>
    </section>`
  }

  function page2(){
    const cases = data.caseStudies.map(c=>`<article class="case"><div class="case-head"><h3>${esc(c.title)}</h3><time>${esc(c.period)}</time></div><ul>${c.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></article>`).join('');
    const timeline = data.timeline.map(t=>`<div class="timeline-item"><time>${esc(t.period)}</time><h3>${esc(t.company)}</h3><strong>${esc(t.role)}</strong><p>${esc(t.detail)}</p></div>`).join('');
    return `<section class="page light page2"><h1>Telephony, Systems & Delivery</h1><div class="evidence-grid"><div class="box"><h2>Selected telephony case studies</h2>${cases}</div><div class="box"><h2>Recent enterprise experience</h2>${timeline}</div><div><div class="box"><h2>Telephony integration capability</h2><ul class="cap-columns">${data.telephonyCapabilities.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="stack">${data.technologies.slice(0,10).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></div><div class="box" style="margin-top:4mm"><h2>AI, automation & infrastructure</h2><ul class="cap-columns">${data.aiInfra.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div></div><div class="lower-grid"><div class="box"><h2>Languages</h2><div class="lang-grid">${data.languages.map(x=>`<div class="lang"><strong>${esc(x.name)}</strong>${esc(x.level)}</div>`).join('')}</div></div><div class="box"><h2>Education</h2><ul class="edu-list">${data.education.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><a href="mailto:${esc(data.profile.email)}" class="box"><h2>Availability</h2><p style="font-size:8px;line-height:1.5">${esc(data.profile.availability)}</p><strong class="accent">${esc(data.profile.email)}</strong></a></div><div class="page2-footer"><span>Jan Kočí · Systems Architect</span><span>${link(data.profile.linkedinUrl,data.profile.linkedinLabel)}</span><span>${link(data.profile.githubUrl,data.profile.githubLabel)}</span></div></section>`
  }

  function render(){ document.getElementById('document').innerHTML = page1()+page2(); save(); }
  const fieldDefs=[['profile.name','Name'],['profile.title','Title'],['profile.subtitle','Subtitle'],['profile.email','Email'],['profile.linkedinLabel','LinkedIn label'],['profile.linkedinUrl','LinkedIn URL'],['profile.githubLabel','GitHub label'],['profile.githubUrl','GitHub URL'],['profile.city','Location'],['profile.summary','Summary'],['profile.availability','Availability / CTA'],['cybercore.repositoryStatus','Repository status']];
  function getPath(path){return path.split('.').reduce((o,k)=>o[k],data)}
  function setPath(path,value){const parts=path.split('.');const last=parts.pop();const obj=parts.reduce((o,k)=>o[k],data);obj[last]=value}
  function buildEditor(){const root=document.getElementById('editorFields');root.innerHTML=fieldDefs.map(([p,l])=>`<div class="field"><label>${l}</label>${['profile.summary','profile.availability'].includes(p)?`<textarea data-path="${p}">${esc(getPath(p))}</textarea>`:`<input data-path="${p}" value="${esc(getPath(p))}">`}</div>`).join('');root.querySelectorAll('[data-path]').forEach(el=>el.addEventListener('input',e=>{setPath(e.target.dataset.path,e.target.value);render()}))}
  document.getElementById('editBtn').onclick=()=>document.getElementById('editor').classList.toggle('open');
  document.getElementById('themeBtn').onclick=()=>{const t=document.body.dataset.theme==='dark'?'inverted':'dark';document.body.dataset.theme=t;localStorage.setItem('cybercore-theme',t)};
  document.getElementById('resetBtn').onclick=()=>{data=clone(defaults);localStorage.removeItem('cybercore-career-data');buildEditor();render()};
  document.getElementById('printBtn').onclick=()=>window.print();
  document.getElementById('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cybercore-career-data.json';a.click();URL.revokeObjectURL(a.href)};
  document.getElementById('importInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;data=JSON.parse(await f.text());buildEditor();render()};
  if(qs.get('print')==='1'){document.querySelector('.toolbar').style.display='none'}
  buildEditor();render();
})();
