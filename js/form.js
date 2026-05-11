/* ==============================================
   HEYWOOD CHIPPY — form.js
   Contact form validation + Formspree submission
   ============================================== */

(function () {
  'use strict';

  var form    = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  var error   = document.getElementById('formError');
  var btn     = form ? form.querySelector('button[type="submit"]') : null;

  if (!form) return;

  function showError(msg) {
    if (error) { error.textContent = msg; error.classList.add('show'); }
    if (success) success.classList.remove('show');
    form.classList.add('form-shaking');
    setTimeout(function () { form.classList.remove('form-shaking'); }, 450);
  }

  function setLoading(loading) {
    if (!btn) return;
    btn.disabled    = loading;
    btn.textContent = loading ? 'Sending…' : 'Send Message';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name    = (form.querySelector('#name')    || {}).value || '';
    var email   = (form.querySelector('#email')   || {}).value || '';
    var message = (form.querySelector('#message') || {}).value || '';

    if (!name.trim() || !email.trim() || !message.trim()) {
      showError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      var emailEl = form.querySelector('#email');
      if (emailEl) { emailEl.style.borderColor = '#e53e3e'; setTimeout(function () { emailEl.style.borderColor = ''; }, 2200); }
      showError('Please enter a valid email address.');
      return;
    }

    if (error)   error.classList.remove('show');
    if (success) success.classList.remove('show');
    setLoading(true);

    var data = new FormData(form);

    fetch(form.action, {
      method:  'POST',
      body:    data,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      setLoading(false);
      if (res.ok) {
        form.reset();
        if (success) success.classList.add('show');
        setTimeout(function () { if (success) success.classList.remove('show'); }, 6000);
      } else {
        showError('Something went wrong. Please try again or call us on 01706 627702.');
      }
    })
    .catch(function () {
      setLoading(false);
      showError('Unable to send — please call us on 01706 627702 instead.');
    });
  });

  // Live input border reset
  form.querySelectorAll('input, textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      this.style.borderColor = '';
    });
  });

})();
