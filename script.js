/**
 * Master Architecture Script & Tracking Engine
 * Riyadh Contractor for Renovation, Decor & Painting
 * 100% Script-Only Tracking, Cloudflare Clean, Instant Conversion
 */

(function () {
  'use strict';

  // --- Configuration Constants ---
  const GOOGLE_ADS_ID = 'AW-XXXXXXXXXXX';
  const LABEL_CALL = 'XXXXXXXXXXXXXXXXXX';
  const LABEL_WHATSAPP = 'XXXXXXXXXXXXXXXXXX';
  const LABEL_FORM = 'XXXXXXXXXXXXXXXXXX';

  const CLIENT_PHONE_LOCAL = '0552449748';
  const CLIENT_PHONE_INT = '966552449748';
  const DEVELOPER_PHONE = '0578539687';
  const DEVELOPER_PHONE_INT = '966578539687';

  // --- 1. Cloudflare Service Worker Auto-Cleanup (Rule 4) ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    }).catch(function () {});
  }

  // --- 2. Central Google Tag Initialization (Rule 1) ---
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GOOGLE_ADS_ID, {
    send_page_view: true
  });

  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ADS_ID;
  document.head.appendChild(gtagScript);

  // --- 3. Unified Conversion Dispatcher (AW-ID/Label format) ---
  function triggerGoogleConversion(conversionLabel, callback) {
    let called = false;
    function executeCallback() {
      if (!called) {
        called = true;
        if (typeof callback === 'function') callback();
      }
    }

    // Safety timeout in case gtag fails or is blocked by ad blocker
    const timer = setTimeout(executeCallback, 600);

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: GOOGLE_ADS_ID + '/' + conversionLabel,
        value: 1.0,
        currency: 'SAR',
        event_callback: function () {
          clearTimeout(timer);
          executeCallback();
        }
      });
    } else {
      executeCallback();
    }
  }

  // --- Helper: Device Detection ---
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  }

  // --- 4. Global Event Capture Listener for Links (tel & wa.me) ---
  document.addEventListener('click', function (e) {
    const targetLink = e.target.closest('a');
    if (!targetLink) return;

    const href = targetLink.getAttribute('href') || '';

    // Check for Developer Exemption
    if (href.includes(DEVELOPER_PHONE) || href.includes(DEVELOPER_PHONE_INT)) {
      return; // Do not register ad conversions for developer support contact
    }

    // A. Phone Call Link Detection
    if (href.startsWith('tel:')) {
      if (!isMobileDevice()) {
        // Prevent default frozen app prompt on desktop during Tag Assistant Troubleshoot
        e.preventDefault();
        triggerGoogleConversion(LABEL_CALL, function () {
          alert('للاتصال المباشر بمقاول الرياض: ' + CLIENT_PHONE_LOCAL);
        });
      } else {
        // On Mobile: trigger conversion instantly
        triggerGoogleConversion(LABEL_CALL);
      }
      return;
    }

    // B. WhatsApp Link Detection
    if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      e.preventDefault();
      triggerGoogleConversion(LABEL_WHATSAPP, function () {
        window.open(href, '_blank', 'noopener,noreferrer');
      });
    }
  }, true);

  // --- 5. AJAX Lead Form Handler (.ajax-lead-form) ---
  document.addEventListener('DOMContentLoaded', function () {
    const leadForms = document.querySelectorAll('.ajax-lead-form');

    leadForms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const nameInput = form.querySelector('[name="client_name"]');
        const phoneInput = form.querySelector('[name="client_phone"]');
        const districtInput = form.querySelector('[name="client_district"]');
        const serviceInput = form.querySelector('[name="service_type"]');
        const detailsInput = form.querySelector('[name="project_details"]');

        const name = nameInput ? nameInput.value.trim() : 'غير محدد';
        const phone = phoneInput ? phoneInput.value.trim() : 'غير محدد';
        const district = districtInput ? districtInput.value.trim() : 'الرياض';
        const service = serviceInput ? serviceInput.value.trim() : 'خدمات المقاولات والديكور';
        const details = detailsInput ? detailsInput.value.trim() : 'طلب معاينة وتسعير';

        const whatsappMessage = encodeURIComponent(
          'السلام عليكم ورحمة الله، أود طلب معاينة وتسعير من مؤسستكم:\n' +
          '• الاسم: ' + name + '\n' +
          '• الجوال: ' + phone + '\n' +
          '• الحي / المنطقة: ' + district + '\n' +
          '• الخدمة المطلوبة: ' + service + '\n' +
          '• ملاحظات: ' + details
        );

        const whatsappUrl = 'https://wa.me/' + CLIENT_PHONE_INT + '?text=' + whatsappMessage;

        // Trigger Google Ads Form Conversion then Redirect to WhatsApp
        triggerGoogleConversion(LABEL_FORM, function () {
          window.location.href = whatsappUrl;
        });
      });
    });

    // --- 6. Mobile Drawer & Dropdown Logic ---
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileBackdrop = document.getElementById('mobileBackdrop');
    const drawerClose = document.getElementById('drawerClose');

    function openDrawer() {
      if (mobileDrawer && mobileBackdrop) {
        mobileDrawer.classList.add('open');
        mobileBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeDrawer() {
      if (mobileDrawer && mobileBackdrop) {
        mobileDrawer.classList.remove('open');
        mobileBackdrop.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeDrawer);

    // Desktop/Mobile Dropdown Toggle
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(function (drop) {
      const btn = drop.querySelector('.dropdown-btn');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          drop.classList.toggle('open');
        });
      }
    });

    // Drawer Submenu Toggle
    const drawerDropdownTrigger = document.querySelector('.drawer-dropdown-trigger');
    const drawerSubmenu = document.querySelector('.drawer-submenu');
    if (drawerDropdownTrigger && drawerSubmenu) {
      drawerDropdownTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        drawerSubmenu.classList.toggle('open');
      });
    }

    // Close Dropdowns on outside click
    document.addEventListener('click', function (e) {
      dropdowns.forEach(function (drop) {
        if (!drop.contains(e.target)) {
          drop.classList.remove('open');
        }
      });
    });

    // --- 7. Scroll-to-Top Button Handler ---
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 350) {
          scrollTopBtn.classList.add('visible');
        } else {
          scrollTopBtn.classList.remove('visible');
        }
      });

      scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  });
})();
