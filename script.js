/**
 * SCRIPT.JS - مقاول الرياض لأعمال الترميم والتشطيب والديكورات
 * Architecture: Zero-Error Google Ads Engine + Pure Vanilla Fast Tracking
 * Verified: Instant gtag Boot + No Popups Blocked + Complete Dev Shield
 */

(function () {
  'use strict';

  // --- 1. الإعدادات والبيانات المركزية للعميل ---
  var APP_CONFIG = {
    phoneLocal: '0552449748',
    phoneIntl: '966552449748',
    conversionId: 'AW-18495226943',
    labels: {
      call: '23OqCMz7k5wdEL-Im_NE',
      whatsapp: 'EmDyCM_7k5wdEL-Im_NE',
      form: 'W_C3CNmHgKUdEL-Im_NE'
    }
  };

  // قائمة أرقام المطور بالصيغتين المحلية والدولية لمنع احتساب إحالات الاختبار
  var DEV_NUMS = ['0578539687', '966578539687'];

  // تنظيف أي Service Worker قديم على Cloudflare Pages لمنع الشاشة البيضاء
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      registrations.forEach(function (reg) {
        reg.unregister();
      });
    }).catch(function () {});
  }

  // كشف وضع المطور (عبر الرابط أو التخزين المحلي)
  function isDeveloperSession() {
    try {
      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('dev') === 'true' || urlParams.get('admin') === 'true') {
        localStorage.setItem('riyadh_contractor_dev_mode', '1');
        return true;
      }
      if (localStorage.getItem('riyadh_contractor_dev_mode') === '1') {
        return true;
      }
    } catch (e) {}
    return false;
  }

  var IS_DEV = isDeveloperSession();
  if (IS_DEV) {
    console.info('%c[Tracking Disabled]%c Dev Mode Active', 'color: #ea580c; font-weight: bold;', 'color: inherit;');
  }

  // --- 2. تهيئة جوجل أدز فورياً في النطاق العام (Global Immediate Boot) ---
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', APP_CONFIG.conversionId);

  // حقن سكربت قوقل مباشرة وبدون أي تأخير لضمان التقاط كل نقرة
  (function injectGtagScript() {
    if (IS_DEV) return;
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + APP_CONFIG.conversionId;
    (document.head || document.documentElement).appendChild(script);
  })();

  // --- 3. محرك إرسال الإحالات المعتمد والمباشر ---
  function sendConversionEvent(label) {
    if (IS_DEV) {
      console.log('[Dev Simulation] Conversion Sent:', label);
      return;
    }
    gtag('event', 'conversion', {
      'send_to': APP_CONFIG.conversionId + '/' + label
    });
  }

  // إتاحة الدوال على نطاق window للتوافق مع أي عناصر تستدعيها بالاسم
  window.handleCallClick = function () {
    sendConversionEvent(APP_CONFIG.labels.call);
  };

  window.handleWhatsAppClick = function (customMsg) {
    sendConversionEvent(APP_CONFIG.labels.whatsapp);
    var defaultMsg = 'السلام عليكم مقاول الرياض، أود الاستفسار عن خدمات الترميم والديكور وحجز موعد معاينة.';
    var msg = encodeURIComponent(customMsg || defaultMsg);
    window.location.href = 'https://wa.me/' + APP_CONFIG.phoneIntl + '?text=' + msg;
  };

  // --- 4. مستشعر النقرات الشامل (Capturing Click Listener) بدون منع للمتصفح ---
  document.addEventListener('click', function (e) {
    var targetLink = e.target.closest('a');
    if (!targetLink) return;

    var href = (targetLink.getAttribute('href') || '').trim();
    var lowerHref = href.toLowerCase();

    // فحص استثناء أرقام المطور بالصيغتين لمنع هدر الميزانية
    var isDevClick = DEV_NUMS.some(function (num) {
      return href.includes(num);
    });
    if (isDevClick) return;

    // أ) رصد الاتصال المباشر
    if (lowerHref.startsWith('tel:') || (targetLink.getAttribute('href') && targetLink.getAttribute('href').startsWith('tel:'))) {
      sendConversionEvent(APP_CONFIG.labels.call);
      return;
    }

    // ب) رصد نقرات الواتساب بدون preventDefault حتى لا يُحظر التطبيق على الجوال
    if (lowerHref.includes('wa.me') || lowerHref.includes('whatsapp.com')) {
      sendConversionEvent(APP_CONFIG.labels.whatsapp);
    }
  }, true);

  // --- 5. معالج نموذج الطلب السريع (.ajax-lead-form) ---
  function initLeadForms() {
    var leadForms = document.querySelectorAll('.ajax-lead-form');

    leadForms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        // إرسال الإحالة فوراً لقوقل أدز
        sendConversionEvent(APP_CONFIG.labels.form);

        // قراءة الحقول مع دعم المسميات المختلفة
        var nameInput = form.querySelector('[name="name"], [name="client_name"]');
        var phoneInput = form.querySelector('[name="phone"], [name="client_phone"]');
        var districtInput = form.querySelector('[name="district"], [name="client_district"], [name="notes"]');
        var serviceInput = form.querySelector('[name="service"], [name="service_type"]');
        var detailsInput = form.querySelector('[name="notes"], [name="project_details"]');

        var phone = phoneInput ? phoneInput.value.trim() : '';
        if (!phone) {
          if (phoneInput) {
            phoneInput.style.borderColor = '#ef4444';
            phoneInput.focus();
          }
          return;
        }

        var name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'عميل من الموقع';
        var district = (districtInput && districtInput.value.trim()) ? districtInput.value.trim() : 'الرياض';
        var service = (serviceInput && serviceInput.value.trim()) ? serviceInput.value.trim() : 'خدمات المقاولات والتشطيب';
        var details = (detailsInput && detailsInput.value.trim()) ? detailsInput.value.trim() : 'طلب معاينة وتسعير';

        var message = encodeURIComponent(
          'السلام عليكم ورحمة الله،\nطلب معاينة وتسعير جديد عبر الموقع:\n' +
          '• الاسم: ' + name + '\n' +
          '• الجوال: ' + phone + '\n' +
          '• الحي / المنطقة: ' + district + '\n' +
          '• الخدمة المطلوبة: ' + service + '\n' +
          '• التفاصيل: ' + details
        );

        var whatsappUrl = 'https://wa.me/' + APP_CONFIG.phoneIntl + '?text=' + message;

        // فتح الواتساب بعد 300ms لضمان اكتمال إرسال طلب التتبع
        setTimeout(function () {
          window.open(whatsappUrl, '_blank');
          if (window.location.pathname.indexOf('thank-you') === -1) {
            // توجيه لصفحة الشكر إن وجدت
            try {
              window.location.href = '/thank-you.html';
            } catch (err) {}
          }
        }, 300);
      });
    });
  }

  // --- 6. القائمة الجانبية والقوائم المنسدلة (UI Logic) ---
  function initNavigation() {
    var mobileToggle = document.getElementById('mobileToggle');
    var mobileDrawer = document.getElementById('mobileDrawer');
    var mobileBackdrop = document.getElementById('mobileBackdrop');
    var drawerClose = document.getElementById('drawerClose');

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

    // القوائم المنسدلة في الهيدر
    var dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(function (drop) {
      var btn = drop.querySelector('.dropdown-btn');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          drop.classList.toggle('open');
        });
      }
    });

    // القوائم المنسدلة داخل القائمة الجانبية
    var drawerDropdownTrigger = document.querySelector('.drawer-dropdown-trigger');
    var drawerSubmenu = document.querySelector('.drawer-submenu');
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

  // --- 7. زر الصعود للأعلى ---
  function initScrollToTop() {
    var scrollTopBtn = document.getElementById('scrollTopBtn');
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

  // --- 8. تشغيل المكونات فور اكتمال بنية الصفحة ---
  document.addEventListener('DOMContentLoaded', function () {
    // رصد تلقائي لصفحة الشكر في حال وصول العميل إليها مباشرة
    if (window.location.pathname.includes('thank-you')) {
      sendConversionEvent(APP_CONFIG.labels.form);
    }

    initLeadForms();
    initNavigation();
    initScrollToTop();
  });

})();
