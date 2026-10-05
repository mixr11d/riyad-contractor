/**
 * Master Architecture Script & Tracking Engine
 * Riyadh Contractor for Renovation, Decor & Painting
 * 100% Script-Only Tracking, Cloudflare Clean, Instant Conversion
 */

(function () {
  'use strict';

  // --- Configuration Constants ---
  const GOOGLE_ADS_ID = 'AW-18495226943';
  const LABEL_CALL = 'mQp6CM_L6pEdEL-Im_NE';
  const LABEL_WHATSAPP = 'mlIxCNLL6pEdEL-Im_NE';
  const LABEL_FORM = 'R1VKCLLY6pEdEL-Im_NE';

  const CLIENT_PHONE_LOCAL = '0552449748';
  const CLIENT_PHONE_INT = '966552449748';
  const DEVELOPER_PHONE = '0578539687';
  const DEVELOPER_PHONE_INT = '966578539687';

  // --- 1. Cloudflare Service Worker Auto-Cleanup ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    }).catch(function () {});
  }

  // --- 2. Central Google Tag Initialization ---
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

  // --- 3. Unified Conversion Dispatcher ---
  function triggerGoogleConversion(conversionLabel, callback) {
    let called = false;
    function executeCallback() {
      if (!called) {
        called = true;
        if (typeof callback === 'function') callback();
      }
    }

    // مهلة أمان لضمان عدم تعليق المتصفح في حال وجود مانع إعلانات (AdBlocker)
    const timer = setTimeout(executeCallback, 500);

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

    // استثناء أرقام المطور من احتساب التحويلات
    if (href.includes(DEVELOPER_PHONE) || href.includes(DEVELOPER_PHONE_INT)) {
      return;
    }

    // أ) روابط الاتصال (Call Tracking)
    if (href.startsWith('tel:')) {
      e.preventDefault(); // منع السلوك الافتراضي لضمان اكتمال التتبع
      if (!isMobileDevice()) {
        triggerGoogleConversion(LABEL_CALL, function () {
          alert('للاتصال المباشر بمقاول الرياض: ' + CLIENT_PHONE_LOCAL);
        });
      } else {
        // على الجوال: إرسال التحويل ثم فتح الاتصال مباشرة
        triggerGoogleConversion(LABEL_CALL, function () {
          window.location.href = href;
        });
      }
      return;
    }

    // ب) روابط الواتساب (WhatsApp Tracking)
    if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      e.preventDefault();
      triggerGoogleConversion(LABEL_WHATSAPP, function () {
        // التحويل في نفس التبويب لتفادي حظر الآيفون للنوافذ المنبثقة
        window.location.href = href;
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

        const phone = phoneInput ? phoneInput.value.trim() : '';

        // منع إرسال النموذج إذا كان الجوال فارغاً لتفادي حرق ميزانية الإعلانات
        if (!phone || phone.length < 9) {
          alert('فضلاً أدخل رقم جوال صحيح للتواصل معك');
          if (phoneInput) phoneInput.focus();
          return;
        }

        const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'عميل من الموقع';
        const district = (districtInput && districtInput.value.trim()) ? districtInput.value.trim() : 'الرياض';
        const service = (serviceInput && serviceInput.value.trim()) ? serviceInput.value.trim() : 'خدمات المقاولات والديكور';
        const details = (detailsInput && detailsInput.value.trim()) ? detailsInput.value.trim() : 'طلب معاينة وتسعير';

        const whatsappMessage = encodeURIComponent(
          'السلام عليكم ورحمة الله، أود طلب معاينة وتسعير من مؤسستكم:\n' +
          '• الاسم: ' + name + '\n' +
          '• الجوال: ' + phone + '\n' +
          '• الحي / المنطقة: ' + district + '\n' +
          '• الخدمة المطلوبة: ' + service + '\n' +
          '• ملاحظات: ' + details
        );

        const whatsappUrl = 'https://wa.me/' + CLIENT_PHONE_INT + '?text=' + whatsappMessage;

        // إرسال التحويل لجوجل أدز ثم التحويل للواتساب
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

    // إغلاق الـ Dropdowns عند النقر بالخارج
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
      }, { passive: true });

      scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  });
})();
