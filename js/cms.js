import { supabase } from './supabase-config.js';

export async function getPageSections(pageName) {
  try {
    const { data, error } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_name', pageName)
      .eq('is_visible', true)
      .order('display_order');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error loading page sections for ${pageName}:`, err);
    return [];
  }
}

export async function getSiteStats() {
  try {
    const { data, error } = await supabase
      .from('site_stats')
      .select('*')
      .order('display_order');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error loading site stats:", err);
    return [];
  }
}

export async function getFAQs(pageName) {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('page_name', pageName)
      .eq('is_active', true)
      .order('display_order');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`Error loading FAQs for ${pageName}:`, err);
    return [];
  }
}

export async function getAnnouncement() {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error("Error loading announcement:", err);
    return null;
  }
}

export async function getToolData(toolSlug) {
  try {
    const { data, error } = await supabase
      .from('tools_cms')
      .select('*')
      .eq('tool_slug', toolSlug)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error(`Error loading tool data for ${toolSlug}:`, err);
    return null;
  }
}

// Injects top page banner
function showAnnouncementBar(ann) {
  if (document.getElementById('cms-top-banner')) return;

  const msg = ann.message || 'New features released!';
  const bg = ann.bg_color || '#0066FF';
  const tc = ann.text_color || '#FFFFFF';
  const lText = ann.link_text || '';
  const lUrl = ann.link_url || '#';

  const banner = document.createElement('div');
  banner.id = 'cms-top-banner';
  banner.style.cssText = `background: ${bg}; color: ${tc}; font-size: 13.5px; font-weight: 700; padding: 12px 40px 12px 24px; text-align: center; position: relative; z-index: 99999; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; box-shadow: 0 4px 15px rgba(0,0,0,0.25);`;

  banner.innerHTML = `
    <span>📢 ${msg}</span>
    ${lText ? `<a href="${lUrl}" style="color: ${tc}; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px; opacity: 0.95; transition: opacity 0.2s;" onmouseover="this.style.opacity='1';" onmouseout="this.style.opacity='0.95';">${lText} &rarr;</a>` : ''}
    <button style="position: absolute; right: 16px; background: transparent; border: none; color: ${tc}; font-size: 18px; font-weight: 300; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 24px; width: 24px; opacity: 0.7; transition: opacity 0.2s;" onclick="document.getElementById('cms-top-banner').remove();" onmouseover="this.style.opacity='1';" onmouseout="this.style.opacity='0.7';">&times;</button>
  `;

  document.body.insertBefore(banner, document.body.firstChild);
}

// Dynamic load Page Content from Supabase
export async function loadPageContent(pageName) {
  try {
    const announcement = await getAnnouncement();
    if (announcement) {
      showAnnouncementBar(announcement);
    }

    const { data: sections, error } = await supabase
      .from('page_sections')
      .select('*')
      .eq('page_name', pageName)
      .eq('is_visible', true)
      .order('display_order');

    if (error || !sections || sections.length === 0) {
      return;
    }

    sections.forEach(section => {
      renderSection(section);
    });

  } catch (err) {
    console.log('CMS fallback to static', err);
  }
}

export function renderSection(section) {
  const content = section.content || {};
  const key = section.section_key;

  const target = document.querySelector(`[data-section="${key}"]`) || document.getElementById(key);
  if (!target) return;

  switch(section.section_type) {
    case 'hero':
      const h1 = target.querySelector('h1');
      const sub = target.querySelector('p');
      const btn1 = target.querySelector('.btn-primary, .cta-btn-1, .btn-explore');
      const btn2 = target.querySelector('.btn-secondary, .cta-btn-2, .btn-start');

      if (h1 && content.heading)
        h1.textContent = content.heading;
      if (sub && content.subheading)
        sub.textContent = content.subheading;
      if (btn1 && content.btn1Text) {
        btn1.textContent = content.btn1Text;
        if (content.btn1Link)
          btn1.href = content.btn1Link;
      }
      if (btn2 && content.btn2Text) {
        btn2.textContent = content.btn2Text;
        if (content.btn2Link)
          btn2.href = content.btn2Link;
      }
      break;

    case 'faq':
      const faqContainer = target.querySelector('.faq-list') || target.querySelector('.faq-wrapper') || target;
      if (!content.faqs) break;
      faqContainer.innerHTML = content.faqs.map((faq, i) => `
        <div class="faq-item">
          <div class="faq-question" onclick="toggleFaq ? toggleFaq(this) : (this.parentElement.classList.toggle('active'))">
            ${faq.question}
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer" id="faq-ans-${i}">
            ${faq.answer}
          </div>
        </div>
      `).join('');
      break;

    case 'stats':
      const statsContainer = target.querySelector('.stats-grid') || target.querySelector('.stats-bar') || target;
      if (!content.stats) break;
      statsContainer.innerHTML = content.stats.map(stat => `
        <div class="stat-item">
          <span class="stat-icon" style="font-size: 24px;">
            ${stat.icon || ''}
          </span>
          <span class="stat-value" style="font-size: 24px; font-weight: 800; color:#00CCFF; display:block;">
            ${stat.value || ''}
          </span>
          <span class="stat-label">
            ${stat.label || ''}
          </span>
        </div>
      `).join('');
      break;

    case 'cards':
      const cardsContainer = target.querySelector('.cards-grid') || target.querySelector('.tools-grid') || target;
      if (!content.cards) break;
      cardsContainer.innerHTML = content.cards.map(card => `
        <div class="card glass-card">
          <div class="card-emoji" style="font-size: 32px; margin-bottom: 12px;">
            ${card.emoji || ''}
          </div>
          <h3 class="card-title">${card.title || ''}</h3>
          <p class="card-desc">${card.description || ''}</p>
          ${card.link ? 
            `<a href="${card.link}" class="card-link-btn" style="color:#00CCFF; text-decoration:none; font-weight:600; font-size:13.5px; display:inline-block; margin-top:8px;">
              Use Tool →
            </a>` : ''}
        </div>
      `).join('');
      break;

    case 'text':
      const textH2 = target.querySelector('h2');
      const textSub = target.querySelector('h3, .subheading');
      const textBody = target.querySelector('.text-body, p');
      if (textH2 && content.heading)
        textH2.textContent = content.heading;
      if (textSub && content.subheading)
        textSub.textContent = content.subheading;
      if (textBody && content.body)
        textBody.innerHTML = content.body;
      break;

    case 'cta':
      const ctaH2 = target.querySelector('h2');
      const ctaSub = target.querySelector('p');
      const ctaBtn = target.querySelector('a, button');
      if (ctaH2 && content.heading)
        ctaH2.textContent = content.heading;
      if (ctaSub && content.subheading)
        ctaSub.textContent = content.subheading;
      if (ctaBtn) {
        if (content.btnText)
          ctaBtn.textContent = content.btnText;
        if (content.btnLink)
          ctaBtn.href = content.btnLink;
      }
      if (content.colorFrom && content.colorTo) {
        target.style.background = `linear-gradient(135deg, ${content.colorFrom}, ${content.colorTo})`;
      }
      break;
  }
}
