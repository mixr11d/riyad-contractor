/**
 * SCRIPT.JS - مقاول الرياض لأعمال الترميم والتشطيب والديكورات
 * Architecture: Based on Verified High-Conversion Engine
 * Features: Google Ads Fast Debug + Clean Tracking + Form & Navigation Handlers
 */

(function () {
  'use strict';

  // --- 1. الإعدادات والبيانات الخاصة بالعميل الحالي ---
  const APP_CONFIG = {
    phoneLocal: '0552449748',
    phoneIntl: '966552449748',
    devPhoneIntl: '966578539687',
    conversionId: 'AW-18495226943',
    labels: {
      call: 'mQp6CM_L6pEdEL-Im_NE',
      whatsapp: 'mlIxCNLL6pEdEL-Im_NE',
      form: 'R1VKCLLY6pEdEL-Im_NE'
    }
  };

  // تنظيف أي Service Worker قديم على Cloudflare
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let reg of registrations) {
        reg.unregister();
      }
    }).catch(function () {});
  }

  // وضع المطور لمنع احتساب تحويلات أثناء التعديل
  function isDeveloperSession() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true' || urlParams.get('admin') === 'true') {
      try {
        localStorage.setItem('riyadh_contractor_dev_mode', '1');
      } catch (e) {}
      return true;
    }
    try {
      if (localStorage.getItem('riyadh_contractor_dev_mode') === '1') {
        return true;
      }
    } catch (e) {}
    return false;
  }

  const IS_DEV = isDeveloperSession();
  if (IS_DEV) {
    console.info('%c[Tracking Disabled]%c Dev Mode Active', 'color: #ea580c; font-weight: bold;', 'color: inherit;');
  }

  // --- 2. تهيئة جوجل أدز (تحميل فوري في وضع الفحص gtm_debug) ---
  function initGoogleAds() {
    if (IS_DEV) return;

    const loadGtag = function () {
      if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${APP_CONFIG.conversionId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', APP_CONFIG.conversionId, {
        send_page_view: true
      });
    };

    // إذا كانت الصفحة مفتوحة عبر Tag Assistant نقوم بالتحميل فوراً
    if (window.location.search.includes('gtm_debug')) {
      loadGtag();
    } else if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadGtag, { timeout: 2000 });
    } else {
      window.addEventListener('load', function () {
        setTimeout(loadGtag, 1000);
      });
    }
  }

  // --- 3. محرك إرسال الإحالات الناجحة (Conversion Dispatcher) ---
  function sendConversionEvent(label, callback) {
    if (IS_DEV) {
      console.log(`[Dev Simulation] Conversion Sent: ${label}`);
      if (typeof callback === 'function') callback();
      return;
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: `${APP_CONFIG.conversionId}/${label}`,
        value: 1.0,
        currency: 'SAR',
        event_callback: function () {
          if (typeof callback === 'function') callback();
        }
      });

      // مؤقت أمان لضمان استمرار التوجيه حتى مع بطء الشبكة
      setTimeout(function () {
        if (typeof callback === 'function') {
          callback();
          callback = null;
        }
      }, 400);
    } else {
      if (typeof callback === 'function') callback();
    }
  }

  // إتاحة الدوال على نطاق window كما في كود العميل السابق
  window.handleCallClick = function () {
    sendConversionEvent(APP_CONFIG.labels.call);
  };

  window.handleWhatsAppClick = function (customMsg) {
    const defaultMsg = 'السلام عليكم مقاول الرياض، أود الاستفسار عن خدمات الترميم والديكور وحجز موعد معاينة.';
    const msg = encodeURIComponent(customMsg || defaultMsg);
    const targetUrl = `https://wa.me/${APP_CONFIG.phoneIntl}?text=${msg}`;

    sendConversionEvent(APP_CONFIG.labels.whatsapp, function () {
      window.location.href = targetUrl;
    });
  };

  // رصد تلقائي لأي زر اتصال أو واتساب في الموقع دون الحاجة لتعديل الـ HTML
  document.addEventListener('click', function (e) {
    const targetLink = e.target.closest('a');
    if (!targetLink) return;

    const href = (targetLink.getAttribute('href') || '').trim();
    const lowerHref = href.toLowerCase();

    // تجاهل أرقام المطور
    if (href.includes(APP_CONFIG.devPhoneIntl)) return;

    // أ) رصد الاتصال: إرسال التحويل فوراً بدون منع المتصفح (حل مشكلة الفحص)
    if (lowerHref.startsWith('tel:')) {
      sendConversionEvent(APP_CONFIG.labels.call);
      return;
    }

    // ب) رصد الواتساب
    if (lowerHref.includes('wa.me') || lowerHref.includes('whatsapp.com')) {
      e.preventDefault();
      sendConversionEvent(APP_CONFIG.labels.whatsapp, function () {
        window.location.href = href;
      });
    }
  }, true);

  // --- 4. معالج نموذج الطلب السريع (.ajax-lead-form) ---
  function initLeadForms() {
    const leadForms = document.querySelectorAll('.ajax-lead-form');

    leadForms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const nameInput = form.querySelector('[name="client_name"]');
        const phoneInput = form.querySelector('[name="client_phone"]');
        const districtInput = form.querySelector('[name="client_district"]');
        const serviceInput = form.querySelector('[name="service_type"]');
        const detailsInput = form.querySelector('[name="project_details"]');

        const phone = phoneInput ? phoneInput.value.trim() : '';
        if (!phone || phone.length < 9) {
          alert('فضلاً أدخل رقم جوال صحيح');
          if (phoneInput) phoneInput.focus();
          return;
        }

        const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'عميل من الموقع';
        const district = (districtInput && districtInput.value.trim()) ? districtInput.value.trim() : 'الرياض';
        const service = (serviceInput && serviceInput.value.trim()) ? serviceInput.value.trim() : 'خدمات المقاولات والترميم';
        const details = (detailsInput && detailsInput.value.trim()) ? detailsInput.value.trim() : 'طلب معاينة وتسعير';

        const message = encodeURIComponent(
          'السلام عليكم ورحمة الله، أود طلب معاينة وتسعير من مؤسستكم:\n' +
          '• الاسم: ' + name + '\n' +
          '• الجوال: ' + phone + '\n' +
          '• الحي / المنطقة: ' + district + '\n' +
          '• الخدمة المطلوبة: ' + service + '\n' +
          '• ملاحظات: ' + details
        );

        const whatsappUrl = `https://wa.me/${APP_CONFIG.phoneIntl}?text=${message}`;

        sendConversionEvent(APP_CONFIG.labels.form, function () {
          window.location.href = whatsappUrl;
        });
      });
    });
  }

  // --- 5. القائمة الجانبية والقوائم المنسدلة (UI Logic) ---
  function initNavigation() {
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

    // القوائم المنسدلة
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

    const drawerDropdownTrigger = document.querySelector('.drawer-dropdown-trigger');
    const drawerSubmenu = document.querySelector('.drawer-submenu');
    if (drawerDropdownTrigger && drawerSubmenu) {
      drawerDropdownTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        drawerSubmenu.classList.toggle('open');
      });
    }

    document.addEventListener('click', function (e) {
      dropdowns.forEach(function (drop) {
        if (!drop.contains(e.target)) {
          drop.classList.remove('open');
        }
      });
    });
  }

  // --- 6. زر الصعود للأعلى ---
  function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (!scrollTopBtn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- 7. تشغيل الدوال عند جاهزية الصفحة ---
  document.addEventListener('DOMContentLoaded', function () {
    initGoogleAds();
    initLeadForms();
    initNavigation();
    initScrollToTop();
  });

})();
