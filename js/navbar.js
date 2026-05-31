import { supabase } from './supabase-config.js';
import { signOut } from './auth.js';

const style = document.createElement('style');
style.textContent = `
  /* Navigation Bar Styles */
  #main-navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: rgba(5, 5, 16, 0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0, 102, 255, 0.2);
    font-family: 'Inter', sans-serif;
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
  }

  .nav-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    text-decoration: none;
    background: linear-gradient(135deg, #00CCFF, #7B2FFF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.5px;
  }

  .logo span {
    color: #0066FF;
    -webkit-text-fill-color: #0066FF;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .btn {
    padding: 8px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-login {
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
  }

  .btn-login:hover {
    border-color: #0066FF;
    background: rgba(0, 102, 255, 0.1);
  }

  .btn-signup {
    color: #fff;
    background: #0066FF;
    border: 1px solid #0066FF;
    box-shadow: 0 4px 15px rgba(0, 102, 255, 0.3);
  }

  .btn-signup:hover {
    background: #00CCFF;
    border-color: #00CCFF;
    box-shadow: 0 4px 15px rgba(0, 204, 255, 0.4);
    transform: translateY(-1px);
  }

  /* User Menu */
  .user-menu {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #fff;
    font-size: 14px;
    border: 2px solid rgba(0, 204, 255, 0.4);
    transition: all 0.3s ease;
  }

  .user-menu:hover .avatar {
    border-color: #00CCFF;
    box-shadow: 0 0 10px rgba(0, 204, 255, 0.5);
  }

  .username {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
  }

  .user-dropdown {
    position: absolute;
    top: 50px;
    right: 0;
    width: 180px;
    background: rgba(5, 5, 16, 0.98);
    border: 1px solid rgba(0, 102, 255, 0.3);
    border-radius: 10px;
    padding: 8px 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    display: none;
    flex-direction: column;
    z-index: 1001;
  }

  .user-dropdown a, .user-dropdown button {
    padding: 10px 16px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 14px;
    text-align: left;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .user-dropdown a:hover, .user-dropdown button:hover {
    color: #00CCFF;
    background: rgba(0, 102, 255, 0.15);
    padding-left: 20px;
  }

  .user-menu:hover .user-dropdown {
    display: flex;
  }

  /* Hamburger Menu */
  .hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .hamburger span {
    display: block;
    width: 24px;
    height: 2px;
    background-color: #fff;
    transition: all 0.3s ease;
  }

  /* Categories Bar */
  .categories-bar {
    display: flex;
    justify-content: center;
    gap: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: 10px 0;
  }

  .category-tab {
    position: relative;
    padding: 8px 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .category-tab:hover {
    color: #00CCFF;
  }

  /* Mega Dropdown Menu */
  .mega-menu {
    position: absolute;
    top: 36px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background: rgba(5, 5, 16, 0.98);
    border: 1px solid rgba(0, 102, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    padding: 24px;
    min-width: 500px;
    display: none;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
    pointer-events: none;
  }

  .single-column {
    min-width: 280px;
    grid-template-columns: 1fr;
  }

  .category-tab:hover .mega-menu {
    display: grid;
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }

  .mega-col-title {
    font-size: 12px;
    font-weight: 700;
    color: #0066FF;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mega-col-title a {
    color: #00CCFF;
    text-transform: none;
    font-size: 11px;
    text-decoration: none;
  }

  .mega-col-title a:hover {
    text-decoration: underline;
  }

  .mega-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mega-link {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px;
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.2s ease;
    border-left: 2px solid transparent;
  }

  .mega-link:hover {
    background: rgba(0, 102, 255, 0.1);
    border-left-color: #0066FF;
    padding-left: 12px;
  }

  .mega-link-emoji {
    font-size: 16px;
  }

  .mega-link-info {
    display: flex;
    flex-direction: column;
  }

  .mega-link-name {
    font-weight: 700;
    font-size: 13px;
    color: #fff;
  }

  .mega-link-desc {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 2px;
  }

  /* Mobile responsiveness styles */
  @media (max-width: 900px) {
    .categories-bar {
      display: none;
      flex-direction: column;
      width: 100%;
      border-top: none;
      padding: 10px 0;
      gap: 0;
    }

    .categories-bar.mobile-active {
      display: flex;
    }

    .hamburger {
      display: flex;
    }

    .nav-top {
      width: 100%;
    }

    .category-tab {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .mega-menu {
      position: static;
      transform: none;
      min-width: 100%;
      box-shadow: none;
      border: none;
      background: rgba(0, 0, 0, 0.2);
      padding: 12px 10px;
      margin-top: 8px;
      display: none;
      grid-template-columns: 1fr;
      opacity: 1;
      pointer-events: auto;
    }

    .category-tab.active .mega-menu {
      display: grid;
    }

    .category-tab:hover .mega-menu {
      display: none;
    }

    .category-tab.active:hover .mega-menu {
      display: grid;
    }
  }
`;
document.head.appendChild(style);

// Structure definition for categories and tools
const navigationStructure = [
  {
    title: '🔍 SEO Tools',
    catSlug: 'seo',
    columns: [
      {
        title: 'On-Page SEO',
        links: [
          { name: 'Meta Tag Generator', emoji: '🏷️', url: '/tools/meta-tag-generator.html', desc: 'Create Google-friendly meta tags' },
          { name: 'Keyword Density Checker', emoji: '📊', url: '/tools/keyword-density.html', desc: 'Analyze text keyword usage' },
          { name: 'Robots.txt Generator', emoji: '🤖', url: '/tools/robots-txt-generator.html', desc: 'Create robots.txt directives' },
          { name: 'Sitemap Generator', emoji: '🗺️', url: '/tools/sitemap-generator.html', desc: 'Generate complete XML sitemaps' },
          { name: 'Google Index Checker', emoji: '🔍', url: '/tools/google-index-checker.html', desc: 'Verify index status on Google' },
          { name: 'HTTP Headers Checker', emoji: '🌐', url: '/tools/http-headers-checker.html', desc: 'Inspect request/response headers' }
        ]
      },
      {
        title: 'Authority & Analysis',
        links: [
          { name: 'Website SEO Score Checker', emoji: '💯', url: '/tools/seo-score-checker.html', desc: 'Analyze technical web score' },
          { name: 'Domain Age Checker', emoji: '⏳', url: '/tools/domain-age-checker.html', desc: 'Check domains registration age' },
          { name: 'DA PA Checker', emoji: '📈', url: '/tools/da-pa-checker.html', desc: 'Estimate Domain & Page Authority' },
          { name: 'Backlink Checker', emoji: '🔗', url: '/tools/backlink-checker.html', desc: 'Analyze backlink profile' }
        ]
      }
    ]
  },
  {
    title: '✍️ Text Tools',
    catSlug: 'text',
    columns: [
      {
        title: 'Writing & Checking',
        links: [
          { name: 'Plagiarism Checker', emoji: '🔍', url: '/tools/plagiarism-checker.html', desc: 'Scan for duplicate contents' },
          { name: 'Grammar Checker', emoji: '📝', url: '/tools/grammar-checker.html', desc: 'Correct spelling and grammars' },
          { name: 'Readability Checker', emoji: '📖', url: '/tools/readability-checker.html', desc: 'Calculate Flesch score' },
          { name: 'Article Rewriter', emoji: '🔄', url: '/tools/article-rewriter.html', desc: 'Rewrite copy with synonyms' },
          { name: 'Word Counter', emoji: '🔢', url: '/tools/word-counter.html', desc: 'Check words and character stats' }
        ]
      },
      {
        title: 'Text Editing',
        links: [
          { name: 'Text Case Converter', emoji: '🔠', url: '/tools/text-case-converter.html', desc: 'Convert upper, lower, title cases' },
          { name: 'Remove Duplicate Lines', emoji: '➖', url: '/tools/remove-duplicate-lines.html', desc: 'Clean duplicate list rows' },
          { name: 'Word Combiner', emoji: '🔀', url: '/tools/word-combiner.html', desc: 'Combine lists of terms' },
          { name: 'Text to Binary', emoji: '💻', url: '/tools/text-to-binary.html', desc: 'Encode textual data to binary' },
          { name: 'Lorem Ipsum Generator', emoji: '📜', url: '/tools/lorem-ipsum.html', desc: 'Generate dummy filler content' }
        ]
      }
    ]
  },
  {
    title: '🖼️ Image Tools',
    catSlug: 'image',
    columns: [
      {
        title: 'Optimization',
        links: [
          { name: 'Image Compressor', emoji: '📉', url: '/tools/image-compressor.html', desc: 'Reduce weight of image files' },
          { name: 'Image Resizer', emoji: '📐', url: '/tools/image-resizer.html', desc: 'Resize image dimension canvas' },
          { name: 'JPG to PNG Converter', emoji: '🔁', url: '/tools/jpg-to-png.html', desc: 'Convert formats easily' },
          { name: 'Favicon Generator', emoji: '✨', url: '/tools/favicon-generator.html', desc: 'Create favicon.ico files' }
        ]
      },
      {
        title: 'Extraction',
        links: [
          { name: 'Image to Text (OCR)', emoji: '👁️', url: '/tools/image-to-text.html', desc: 'Extract text contents from images' },
          { name: 'Color Picker & Converter', emoji: '🎨', url: '/tools/color-picker.html', desc: 'Find color hex & harmonies' }
        ]
      }
    ]
  },
  {
    title: '🎬 Video Tools',
    catSlug: 'video',
    singleColumn: true,
    columns: [
      {
        title: 'Video Utilities',
        links: [
          { name: 'YouTube Thumbnail Downloader', emoji: '🖼️', url: '/tools/youtube-thumbnail-downloader.html', desc: 'Get HD YouTube thumbnails' },
          { name: 'YouTube Hashtag Generator', emoji: '🏷️', url: '/tools/youtube-hashtag-generator.html', desc: 'Generate relevant hashtags' },
          { name: 'YouTube to MP3 Converter', emoji: '🎵', url: '/tools/youtube-to-mp3.html', desc: 'Convert video URL to audio track' },
          { name: 'TikTok Video Downloader', emoji: '🎥', url: '/tools/tiktok-downloader.html', desc: 'Download without watermark' }
        ]
      }
    ]
  },
  {
    title: '🧑💻 Developer Tools',
    catSlug: 'developer',
    columns: [
      {
        title: 'Code Tools',
        links: [
          { name: 'JSON Formatter & Validator', emoji: '💽', url: '/tools/json-formatter.html', desc: 'Validate and beautify JSON objects' },
          { name: 'Base64 Encoder/Decoder', emoji: '🗝️', url: '/tools/base64-encoder.html', desc: 'Encode base64 strings or images' },
          { name: 'URL Encoder/Decoder', emoji: '🔗', url: '/tools/url-encoder.html', desc: 'Safe-encode query parameters' },
          { name: 'MD5/SHA256 Hash Generator', emoji: '🔒', url: '/tools/hash-generator.html', desc: 'Generate secure hashing checksums' }
        ]
      },
      {
        title: 'Generators',
        links: [
          { name: 'QR Code Generator', emoji: '📱', url: '/tools/qr-code-generator.html', desc: 'Create customizable QR codes' },
          { name: 'Password Generator', emoji: '🔐', url: '/tools/password-generator.html', desc: 'Generate cryptographically strong keys' },
          { name: 'Lorem Ipsum Generator', emoji: '📜', url: '/tools/lorem-ipsum.html', desc: 'Generate placeholder layout filler text' }
        ]
      }
    ]
  },
  {
    title: '🔄 Converter Tools',
    catSlug: 'converter',
    singleColumn: true,
    columns: [
      {
        title: 'Quick Conversions',
        links: [
          { name: 'Binary/Hex/Decimal Converter', emoji: '🧮', url: '/tools/binary-converter.html', desc: 'Interconvert base systems live' },
          { name: 'Age Calculator', emoji: '📅', url: '/tools/age-calculator.html', desc: 'Determine chronological exact age' },
          { name: 'Unit Converter', emoji: '⚖️', url: '/tools/unit-converter.html', desc: 'Convert metric weight, volume, length' },
          { name: 'Scientific Calculator', emoji: '➗', url: '/tools/scientific-calculator.html', desc: 'Perform multi-base computations' }
        ]
      }
    ]
  }
];

// Build and inject navbar
async function initNavbar() {
  const container = document.createElement('header');
  container.id = 'main-navbar';

  let navTopHtml = `
    <div class="nav-container">
      <div class="nav-top">
        <a href="/index.html" class="logo">DevTool<span>Kit</span></a>
        <div class="nav-actions" id="nav-actions-container">
          <span style="color: rgba(255,255,255,0.4); font-size:12px;">Loading auth...</span>
        </div>
        <button class="hamburger" id="hamburger-btn" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
  `;

  // Build categories dropdowns
  let categoriesHtml = `<div class="categories-bar" id="categories-bar">`;
  navigationStructure.forEach(cat => {
    const isSingle = cat.singleColumn ? ' single-column' : '';
    let menuHtml = `<div class="category-tab">${cat.title} <span style="font-size:10px;">▼</span>
      <div class="mega-menu${isSingle}">`;

    cat.columns.forEach(col => {
      menuHtml += `
        <div>
          <div class="mega-col-title">
            ${col.title}
            <a href="/category-${cat.catSlug}.html">View All →</a>
          </div>
          <div class="mega-links">
      `;
      col.links.forEach(link => {
        menuHtml += `
          <a href="${link.url}" class="mega-link">
            <span class="mega-link-emoji">${link.emoji}</span>
            <div class="mega-link-info">
              <span class="mega-link-name">${link.name}</span>
              <span class="mega-link-desc">${link.desc}</span>
            </div>
          </a>
        `;
      });
      menuHtml += `</div></div>`;
    });

    menuHtml += `</div></div>`;
    categoriesHtml += menuHtml;
  });
  categoriesHtml += `</div>`;

  // Search bar below navbar row HTML
  let searchBarHtml = `
    <div class="nav-search-bar" style="max-width: 600px; margin: 8px auto 12px auto; width: 100%; position: relative; padding: 0 24px; box-sizing: border-box;">
      <input type="text" class="search-box" id="nav-search-input" placeholder="Search 40+ free tools..." style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(0, 102, 255, 0.2); border-radius:8px; padding:10px 16px; font-size:14px; color:#fff; outline:none; transition:all 0.3s ease; font-family:inherit;">
      <button id="nav-search-clear-btn" style="position:absolute; right:36px; top:50%; transform:translateY(-50%); background:transparent; border:none; color:rgba(255,255,255,0.4); cursor:pointer; font-size:16px; display:none;">✕</button>
      <div id="nav-search-results" style="position:absolute; top:42px; left:24px; right:24px; background:rgba(5, 5, 16, 0.98); border:1px solid rgba(0, 102, 255, 0.3); border-radius:10px; max-height:280px; overflow-y:auto; z-index:99999; display:none; box-shadow:0 10px 30px rgba(0,0,0,0.8);"></div>
    </div>
  `;

  container.innerHTML = navTopHtml + categoriesHtml + searchBarHtml + '</div>';
  document.body.prepend(container);

  // Setup Mobile Hamburger toggle
  const hamburger = document.getElementById('hamburger-btn');
  const catBar = document.getElementById('categories-bar');
  hamburger.addEventListener('click', () => {
    catBar.classList.toggle('mobile-active');
  });

  // Mobile click-to-expand categories
  const categoryTabs = document.querySelectorAll('.category-tab');
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        // Only trigger if click is directly on the tab name (not inside dropdown)
        if (e.target === tab || e.target.tagName === 'SPAN') {
          tab.classList.toggle('active');
        }
      }
    });
  });

  // Search logic setup
  const searchInput = document.getElementById('nav-search-input');
  const searchClearBtn = document.getElementById('nav-search-clear-btn');
  const searchResults = document.getElementById('nav-search-results');

  const allTools = [];
  navigationStructure.forEach(cat => {
    cat.columns.forEach(col => {
      col.links.forEach(link => {
        allTools.push({
          name: link.name,
          emoji: link.emoji,
          url: link.url,
          cat: cat.catSlug,
          desc: link.desc
        });
      });
    });
  });

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (q.length === 0) {
      searchClearBtn.style.display = 'none';
      searchResults.style.display = 'none';
      return;
    }
    searchClearBtn.style.display = 'block';
    const filtered = allTools.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.desc.toLowerCase().includes(q)
    );
    if (filtered.length > 0) {
      searchResults.innerHTML = '';
      filtered.forEach(t => {
        const item = document.createElement('a');
        item.href = t.url;
        item.style.cssText = `
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #fff;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.2s ease;
        `;
        item.innerHTML = `
          <span style="font-size:18px;">${t.emoji}</span>
          <div style="display:flex; flex-direction:column;">
            <span style="font-weight:700; font-size:13px;">${t.name}</span>
            <span style="font-size:11px; color:rgba(255,255,255,0.5);">${t.desc}</span>
          </div>
        `;
        item.addEventListener('mouseenter', () => {
          item.style.background = 'rgba(0, 102, 255, 0.15)';
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = 'transparent';
        });
        searchResults.appendChild(item);
      });
      searchResults.style.display = 'block';
    } else {
      searchResults.innerHTML = `<div style="padding:12px; font-size:12px; color:rgba(255,255,255,0.4); text-align:center;">No tools found matching "${q}"</div>`;
      searchResults.style.display = 'block';
    }
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    searchResults.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });

  // Load Auth state
  const actionsContainer = document.getElementById('nav-actions-container');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const user = session.user;
      
      // Fetch avatar color and initials from profiles
      let initials = user.email.slice(0, 2).toUpperCase();
      let avatarColor = '#0066FF';
      let displayName = user.email.split('@')[0];

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_color')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          displayName = profile.display_name || profile.username || displayName;
          initials = displayName.slice(0, 2).toUpperCase();
          avatarColor = profile.avatar_color || avatarColor;
        }
      } catch (err) {
        console.error('Error fetching profile in nav:', err);
      }

      actionsContainer.innerHTML = `
        <div class="user-menu" id="user-menu-trigger">
          <div class="avatar" style="background: ${avatarColor};">${initials}</div>
          <span class="username">${displayName}</span>
          <div class="user-dropdown">
            <a href="/dashboard.html">🚀 Dashboard</a>
            <a href="/profile.html">⚙️ Profile</a>
            <a href="/history.html">📜 History</a>
            <button id="nav-signout-btn">🚪 Logout</button>
          </div>
        </div>
      `;

      document.getElementById('nav-signout-btn').addEventListener('click', signOut);

    } else {
      actionsContainer.innerHTML = `
        <a href="/login.html" class="btn btn-login">Login</a>
        <a href="/signup.html" class="btn btn-signup">Sign Up</a>
      `;
    }
  } catch (error) {
    console.error('Navbar auth integration error:', error);
    actionsContainer.innerHTML = `
      <a href="/login.html" class="btn btn-login">Login</a>
      <a href="/signup.html" class="btn btn-signup">Sign Up</a>
    `;
  }
}

// Automatically init navbar on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbar);
} else {
  initNavbar();
}
