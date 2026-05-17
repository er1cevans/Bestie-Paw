/* ============================================
   Bestie Paw — 共享脚本
   ============================================ */

/* ---------- 表单验证工具 ---------- */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('input-error');
  let hint = field.parentElement.querySelector('.field-error');
  if (!hint) {
    hint = document.createElement('p');
    hint.className = 'field-error form-hint';
    hint.style.color = '#E24B4A';
    field.parentElement.appendChild(hint);
  }
  hint.textContent = message;
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove('input-error');
  const hint = field.parentElement.querySelector('.field-error');
  if (hint) hint.remove();
}

/* ---------- 注册页逻辑 ---------- */

function initRegister() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const inputs = form.querySelectorAll('.form-input, .form-select');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        showError(input.id, '此项为必填项');
      } else {
        clearError(input.id);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const username = document.getElementById('username');
    const email    = document.getElementById('email');
    const phone    = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirm  = document.getElementById('confirm-password');

    if (!username.value.trim() || username.value.trim().length < 2) {
      showError('username', '昵称至少需要 2 个字符');
      valid = false;
    } else { clearError('username'); }

    if (!validateEmail(email.value)) {
      showError('email', '请输入有效的邮箱地址');
      valid = false;
    } else { clearError('email'); }

    if (phone.value && !validatePhone(phone.value)) {
      showError('phone', '请输入有效的手机号');
      valid = false;
    } else { clearError('phone'); }

    if (password.value.length < 8) {
      showError('password', '密码至少 8 位');
      valid = false;
    } else { clearError('password'); }

    if (confirm.value !== password.value) {
      showError('confirm-password', '两次输入的密码不一致');
      valid = false;
    } else { clearError('confirm-password'); }

    if (valid) {
      /* 此处替换为实际 API 调用 */
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = '注册中…';
      btn.disabled = true;
      setTimeout(() => { window.location.href = 'pet-profile.html'; }, 800);
    }
  });
}

/* ---------- 宠物信息页逻辑 ---------- */

function initPetProfile() {
  const form = document.getElementById('pet-form');
  if (!form) return;

  /* 头像上传预览 */
  const avatarInput = document.getElementById('pet-avatar-input');
  const avatarCircle = document.getElementById('avatar-circle');
  if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          avatarCircle.style.backgroundImage = `url(${evt.target.result})`;
          avatarCircle.style.backgroundSize = 'cover';
          avatarCircle.textContent = '';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const petName = document.getElementById('pet-name');
    if (!petName.value.trim()) {
      showError('pet-name', '请填写宠物名字');
      valid = false;
    } else { clearError('pet-name'); }

    if (valid) {
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = '保存中…';
      btn.disabled = true;
      setTimeout(() => { window.location.href = 'index.html'; }, 800);
    }
  });
}

/* ---------- 入口 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initRegister();
  initPetProfile();
});
