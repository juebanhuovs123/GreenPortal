/**
 * 绿投青云 — 主交互逻辑
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============ Header Scroll Effect ============
  const header = document.querySelector('.site-header');
  if (header) {
    const syncHeaderState = () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    syncHeaderState();
    window.addEventListener('scroll', syncHeaderState);
  }

  // ============ Tab Switching (generic) ============
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const groupName = group.dataset.tabGroup;
    const tabs = group.querySelectorAll('[data-tab]');
    const panels = document.querySelectorAll(`[data-panel-group="${groupName}"] [data-panel]`);

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        panels.forEach(p => {
          p.classList.toggle('active', p.dataset.panel === target);
        });
      });
    });
  });

  // ============ Mega Menu Tab Hover ============
  document.querySelectorAll('.mega-tab').forEach(tab => {
    tab.addEventListener('mouseenter', () => {
      const target = tab.dataset.megaTab;
      const parent = tab.closest('.mega-menu-inner');
      parent.querySelectorAll('.mega-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      parent.querySelectorAll('.mega-menu-content').forEach(c => {
        c.classList.toggle('active', c.dataset.megaContent === target);
      });
    });
  });

  // ============ Top Nav Parent Click-through ============
  document.querySelectorAll('.nav-item[data-nav-target]').forEach(item => {
    const target = item.dataset.navTarget;
    if (!target) return;

    item.tabIndex = 0;
    item.setAttribute('role', 'link');

    const goToTarget = () => {
      window.location.href = target;
    };

    item.addEventListener('click', (event) => {
      const clickTarget = event.target instanceof Element ? event.target : null;
      if (clickTarget && clickTarget.closest('.nav-dropdown, .mega-menu')) {
        return;
      }
      goToTarget();
    });

    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      goToTarget();
    });
  });

  // ============ Smooth anchor links ============
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ============ Sidebar active link (product page) ============
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Scroll to corresponding category
      const target = link.getAttribute('href');
      if (target && target.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(target);
        if (el) {
          const offset = 90;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  // ============ Active nav item based on current page ============
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    const navTarget = item.dataset.navTarget;
    if ((href && href.includes(currentPage)) || (navTarget && navTarget.includes(currentPage))) {
      item.classList.add('active');
    }
  });

  // ============ Home hero slider ============
  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider && typeof Swiper !== 'undefined' && !heroSlider.classList.contains('swiper-initialized')) {
    new Swiper(heroSlider, {
      loop: true,
      speed: 1200,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      autoplay: {
        delay: 5600,
        disableOnInteraction: false,
      },
      pagination: {
        el: heroSlider.querySelector('.swiper-pagination'),
        clickable: true,
      },
    });
  }

  // ============ Animate on scroll ============
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.service-card, .product-card, .solution-card, .feature-card, .stat-item, .support-item, .market-card, .saas-card, .capability-card, .insight-card, .matrix-card, .process-step, .section-shell, .demo-panel, .vision-panel').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // Add animate-in class styles
  const style = document.createElement('style');
  style.textContent = `.animate-in { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(style);

  // ============ Search (product page) ============
  const searchInput = document.querySelector('.search-bar input');
  const searchBtn = document.querySelector('.search-bar button');
  if (searchInput && searchBtn) {
    const doSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      document.querySelectorAll('.product-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) || query === '' ? '' : 'none';
      });
    };
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') doSearch();
    });
  }

  // ============ Counter Animation ============
  document.querySelectorAll('.stat-number').forEach(num => {
    const target = parseInt(num.dataset.count || num.textContent);
    const suffix = num.dataset.suffix || '';
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      num.textContent = current + suffix;
      if (current >= target) clearInterval(timer);
    }, 20);
  });

});
