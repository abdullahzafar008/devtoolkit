const STRAPI_URL = 'http://localhost:1337'

async function strapiGet(endpoint) {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/${endpoint}`)
    if (!res.ok) {
      console.log('Strapi error:',
        res.status, endpoint)
      return null
    }
    const json = await res.json()
    return json.data
  } catch(e) {
    console.log('Strapi fetch failed:', e)
    return null
  }
}

async function getPage(pageName) {
  const data = await strapiGet(
    `pages?filters[page_name][$eq]=${pageName}`)
  if (!data || !data.length) return null
  return data[0]
}

async function getStats(pageName) {
  const data = await strapiGet(
    `stats?filters[page_name][$eq]=${pageName}&sort=display_order:asc`)
  return data || []
}

async function getFAQs(pageName) {
  const data = await strapiGet(
    `faqs?filters[page_name][$eq]=${pageName}&filters[is_active][$eq]=true&sort=display_order:asc`)
  return data || []
}

async function getCategory(key) {
  const data = await strapiGet(
    `categories?filters[category_key][$eq]=${key}`)
  if (!data || !data.length) return null
  return data[0]
}

async function getTool(slug) {
  const data = await strapiGet(
    `tools?filters[tool_slug][$eq]=${slug}`)
  if (!data || !data.length) return null
  return data[0]
}

async function getToolFAQs(slug) {
  const data = await strapiGet(
    `tool-faqs?filters[tool_slug][$eq]=${slug}&sort=display_order:asc`)
  return data || []
}

async function loadPageContent(pageName) {
  console.log('CMS: loading', pageName)
  const [page, stats, faqs] =
    await Promise.all([
      getPage(pageName),
      getStats(pageName),
      getFAQs(pageName)
    ])

  console.log('Raw page data:', page)
  console.log('Raw stats data:', stats)
  console.log('Raw faqs data:', faqs)

  if (page) {
    applyPageContent(page)
    console.log('CMS: page loaded ✅')
  }
  if (stats && stats.length) {
    renderStats(stats)
    console.log('CMS: stats loaded ✅')
  }
  if (faqs && faqs.length) {
    renderFAQs(faqs)
    console.log('CMS: faqs loaded ✅')
  }
}

async function loadCategoryContent(key) {
  const [cat, faqs] = await Promise.all([
    getCategory(key),
    getFAQs('category-' + key)
  ])
  if (cat) applyCategoryContent(cat)
  if (faqs && faqs.length) renderFAQs(faqs)
}

async function loadToolContent(slug) {
  const [tool, faqs] = await Promise.all([
    getTool(slug),
    getToolFAQs(slug)
  ])
  if (tool) applyToolContent(tool)
  if (faqs && faqs.length) renderFAQs(faqs)
}

function renderMissionCards(cards) {
  if (!cards || !cards.length) return
  const container = document.querySelector(
    '.mission-cards, .mission-grid, .about-mission')
  if (!container) return
  container.innerHTML = cards.map(c => `
    <div class="mission-card glass-card">
      <div class="mission-icon">
        ${c.icon || ''}
      </div>
      <h3>${c.title || ''}</h3>
      <p>${c.description || ''}</p>
    </div>
  `).join('')
}

function applyPageContent(page) {
  if (!page) return
  console.log('Applying page:', page)

  const heading = document.querySelector(
    'h1, .page-title, .typewriter-text, #typewriter-lbl')
  const sub = document.querySelector(
    '.hero-sub, .page-sub')
  const btn1 = document.querySelector(
    '.hero-btn-explore, .btn-explore')
  const btn2 = document.querySelector(
    '.hero-btn-start, .btn-start')
  
  const story = document.querySelector('.about-story')
  const email = document.querySelector('.contact-email')

  console.log('Found heading:', heading)
  console.log('Found sub:', sub)

  if (heading) {
    if (page.heading) heading.textContent = page.heading
    else if (page.hero_heading) heading.textContent = page.hero_heading
  }
  if (sub) {
    if (page.subheading) sub.textContent = page.subheading
    else if (page.hero_subheading) sub.textContent = page.hero_subheading
  }
  if (story && page.story) {
    story.innerHTML = page.story
  }
  if (email && page.email) {
    email.textContent = page.email
    email.href = `mailto:${page.email}`
  }
  if (btn1) {
    if (page.btn1_text)
      btn1.textContent = page.btn1_text
    if (page.btn1_link)
      btn1.href = page.btn1_link
  }
  if (btn2) {
    if (page.btn2_text)
      btn2.textContent = page.btn2_text
    if (page.btn2_link)
      btn2.href = page.btn2_link
  }
  if (page.mission_cards && Array.isArray(page.mission_cards)) {
    renderMissionCards(page.mission_cards)
  }
  if (page.seo_title)
    document.title = page.seo_title
  if (page.seo_description) {
    const meta = document.querySelector(
      'meta[name="description"]')
    if (meta) meta.setAttribute(
      'content', page.seo_description)
  }
}

function applyCategoryContent(cat) {
  if (!cat) return
  const h1 = document.querySelector(
    'h1, .category-title, .hero-title')
  const sub = document.querySelector(
    '.hero-subtitle, .category-sub')
  const overview = document.querySelector(
    '.overview-text, .category-overview, .category-description')

  if (h1 && cat.hero_heading)
    h1.textContent = cat.hero_heading
  if (sub && cat.hero_subheading)
    sub.textContent = cat.hero_subheading
  if (overview && cat.overview_text)
    overview.innerHTML = cat.overview_text
  if (cat.seo_title)
    document.title = cat.seo_title
  if (cat.seo_description) {
    const meta = document.querySelector(
      'meta[name="description"]')
    if (meta) meta.setAttribute(
      'content', cat.seo_description)
  }
}

function applyToolContent(tool) {
  if (!tool) return
  const h1 = document.querySelector(
    'h1, .tool-title, .hero-title')
  const desc = document.querySelector(
    '.tool-description, .hero-subtitle')
  const longDesc = document.querySelector(
    '.tool-long-desc, .what-is-text')

  if (h1 && tool.tool_name)
    h1.textContent = tool.tool_name
  if (desc && tool.description)
    desc.textContent = tool.description
  if (longDesc && tool.long_description)
    longDesc.innerHTML = tool.long_description
  if (tool.seo_title)
    document.title = tool.seo_title
  if (tool.seo_description) {
    const meta = document.querySelector(
      'meta[name="description"]')
    if (meta) meta.setAttribute(
      'content', tool.seo_description)
  }
}

function renderStats(stats) {
  if (!stats || !stats.length) return
  const container = document.querySelector(
    '#stats, .stats-bar')
  if (!container) {
    console.log('Stats not found!')
    return
  }
  container.innerHTML = stats.map(s => `
    <div class="stat-item">
      <span class="stat-icon">
        ${s.icon || ''}
      </span>
      <span class="stat-value">
        ${s.value || ''}
      </span>
      <span class="stat-label">
        ${s.label || ''}
      </span>
    </div>
  `).join('')
  console.log('✅ Stats rendered!')
}

function renderFAQs(faqs) {
  if (!faqs || !faqs.length) return
  const container = document.querySelector(
    '.faq-list')
  if (!container) {
    console.log('FAQ container not found!')
    return
  }
  container.innerHTML = faqs.map(
    (f, i) => `
    <div class="faq-item">
      <div class="faq-question"
        onclick="
          const ans =
            this.nextElementSibling;
          const icon =
            this.querySelector('.faq-icon');
          ans.classList.toggle('open');
          if(icon) icon.textContent =
            ans.classList.contains('open')
            ? '−' : '+';
        ">
        ${f.question}
        <span class="faq-icon">+</span>
      </div>
      <div class="faq-answer">
        ${f.answer}
      </div>
    </div>
  `).join('')
  console.log('✅ FAQs rendered:',
    faqs.length)
}

export {
  loadPageContent,
  loadCategoryContent,
  loadToolContent,
  renderStats,
  renderFAQs
}
