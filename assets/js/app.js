// App Store Dashboard JS
// Handles navigation, fetching data, rendering tables, modals, toasts

(function(){
  const el = (sel, parent=document) => parent.querySelector(sel)
  const els = (sel, parent=document) => Array.from(parent.querySelectorAll(sel))
  const state = {
    apps: [],
    recent: [],
  }

  // Sidebar toggle
  const sidebar = el('#sidebar')
  el('#sidebarToggle')?.addEventListener('click', ()=>{
    sidebar.classList.toggle('open')
  })

  // Nav routing
  els('.nav-link').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault()
      els('.nav-item').forEach(li=>li.classList.remove('active'))
      a.parentElement.classList.add('active')
      const section = a.getAttribute('data-section')
      els('.content-section').forEach(sec=>sec.classList.remove('active'))
      el(`#${section}-section`)?.classList.add('active')
      el('#currentPage').textContent = a.textContent.trim()
    })
  })

  // Utilities
  const fmt = new Intl.NumberFormat()
  const toast = (id='successToast')=>{
    const t = new bootstrap.Toast(el(`#${id}`))
    t.show()
  }

  // Data fetching (placeholder): expects a static JSON list first
  async function loadApps(){
    try{
      const res = await fetch('data/apps.json', {cache:'no-store'})
      if(!res.ok) throw new Error('Failed to load apps.json')
      const data = await res.json()
      state.apps = data.apps || []
      state.recent = state.apps.slice(0,5)
      renderStats()
      renderRecent()
      renderApps()
    }catch(err){
      console.error(err)
      el('#recentAppsTable').innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load apps data</td></tr>`
      el('#appsTable').innerHTML = `<tr><td colspan="9" class="text-center text-danger">Failed to load apps data</td></tr>`
    }
  }

  function renderStats(){
    el('#totalApps').textContent = state.apps.length
    const totalDownloads = state.apps.reduce((sum,a)=> sum + (a.downloads||0), 0)
    el('#totalDownloads').textContent = fmt.format(totalDownloads)
    const avgRating = state.apps.length ? (state.apps.reduce((s,a)=> s + (a.rating||0),0)/state.apps.length).toFixed(2) : '--'
    el('#avgRating').textContent = avgRating
    el('#monthlyGrowth').textContent = '+--%'
  }

  function starBadge(r){
    const rating = Number(r||0).toFixed(1)
    return `<span class="badge text-bg-warning"><i class='bx bxs-star'></i> ${rating}</span>`
  }

  function statusBadge(s){
    const map = {active:'success', pending:'warning', removed:'secondary'}
    const cls = map[s]||'info'
    return `<span class="badge text-bg-${cls}">${(s||'active').toUpperCase()}</span>`
  }

  function renderRecent(){
    const rows = state.recent.map(a=>`
      <tr>
        <td>${a.name}</td>
        <td>${a.category||'-'}</td>
        <td>${fmt.format(a.downloads||0)}</td>
        <td>${starBadge(a.rating)}</td>
        <td>${statusBadge(a.status)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-app-id="${a.id}">
            <i class='bx bx-show'></i>
          </button>
        </td>
      </tr>
    `).join('')
    el('#recentAppsTable').innerHTML = rows || `<tr><td colspan="6" class="text-center">No data</td></tr>`
    attachRowActions()
  }

  function renderApps(){
    const rows = state.apps.map(a=>`
      <tr>
        <td><img src="${a.icon||'assets/img/app-placeholder.png'}" alt="icon" class="rounded" style="width:40px;height:40px;object-fit:cover"></td>
        <td class="fw-semibold">${a.name}</td>
        <td><span class="badge text-bg-dark">${a.developer}</span></td>
        <td>${a.category||'-'}</td>
        <td>${fmt.format(a.downloads||0)}</td>
        <td>${starBadge(a.rating)}</td>
        <td>${a.version||'-'}</td>
        <td>${statusBadge(a.status)}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary" data-app-id="${a.id}"><i class='bx bx-show'></i></button>
            <a class="btn btn-sm btn-outline-secondary" href="${a.storeUrl||'#'}" target="_blank"><i class='bx bx-link-external'></i></a>
          </div>
        </td>
      </tr>
    `).join('')
    el('#appsTable').innerHTML = rows || `<tr><td colspan="9" class="text-center">No apps</td></tr>`
    attachRowActions()
  }

  function attachRowActions(){
    els('[data-app-id]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-app-id')
        const app = state.apps.find(x=> String(x.id)===String(id))
        if(app){
          showAppModal(app)
        }
      })
    })
  }

  function showAppModal(app){
    el('#modalAppIcon').src = app.icon || 'assets/img/app-placeholder.png'
    el('#modalAppName').textContent = app.name
    el('#modalDeveloper').textContent = app.developer
    el('#modalCategory').textContent = app.category || '-'
    el('#modalDownloads').textContent = fmt.format(app.downloads||0)
    el('#modalRating').innerHTML = starBadge(app.rating)
    el('#modalVersion').textContent = app.version || '-'
    el('#modalDescription').textContent = app.description || 'No description.'
    const modal = new bootstrap.Modal(el('#appDetailsModal'))
    modal.show()
  }

  // Init
  loadApps()
})()
