// comentario
import { currentUser, register, login } from './user-store.js';

const form = document.querySelector('#auth-form');
const message = document.querySelector('#auth-message');
const submit = document.querySelector('#auth-submit');
const tabs = document.querySelectorAll('[role="tab"]');

let mode = 'login';

try {
  if (currentUser()) {
    window.location.replace('/public/pages/perfil.html');
  }
} catch {
  message.textContent =
    'No se pudieron leer los datos. Revisa el almacenamiento del navegador.';
}

function setMode(nextMode) {
  mode = nextMode;
  const isRegister = mode === 'register';

  message.textContent = '';

  for (const name of ['name', 'confirm']) {
    document.querySelector(`#${name}-field`).hidden = !isRegister;
    form.elements[name].disabled = !isRegister;
    form.elements[name].required = isRegister;
  }

  form.elements.password.minLength = isRegister ? 8 : 1;
  form.elements.password.autocomplete =
    isRegister ? 'new-password' : 'current-password';

  document.querySelector('#auth-title').textContent = isRegister
    ? 'Tu próxima historia empieza aquí'
    : 'Qué bueno verte de nuevo';

  document.querySelector('#auth-subtitle').textContent = isRegister
    ? 'Crea tu cuenta con una contraseña de al menos 8 caracteres.'
    : 'Ingresa tus datos para continuar.';

  submit.textContent = isRegister
    ? 'Crear mi cuenta →'
    : 'Iniciar sesión →';

  tabs.forEach(tab => {
    const selected = tab.id === `${mode}-tab`;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  document.querySelector('#auth-panel').setAttribute(
    'aria-labelledby',
    `${mode}-tab`
  );
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    setMode(tab.id === 'register-tab' ? 'register' : 'login');
  });

  tab.addEventListener('keydown', event => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    event.preventDefault();

    if (event.key === 'Home') {
      setMode('login');
    } else if (event.key === 'End') {
      setMode('register');
    } else {
      setMode(mode === 'login' ? 'register' : 'login');
    }

    document.querySelector(`#${mode}-tab`).focus();
  });
});

document.querySelector('#toggle-password').addEventListener(
  'click',
  event => {
    const password = form.elements.password;
    const show = password.type === 'password';

    password.type = show ? 'text' : 'password';

    event.currentTarget.textContent = show ? 'Ocultar' : 'Ver';
    event.currentTarget.setAttribute('aria-pressed', String(show));
    event.currentTarget.setAttribute(
      'aria-label',
      show ? 'Ocultar contraseña' : 'Mostrar contraseña'
    );
  }
);

form.addEventListener('submit', async event => {
  event.preventDefault();
  message.textContent = '';
  submit.disabled = true;
  tabs.forEach(tab => {
    tab.disabled = true;
  });

  try {
    if (mode === 'register') {
      if (
        form.elements.password.value !== form.elements.confirm.value
      ) {
        throw new Error('Las contraseñas no coinciden.');
      }

      await register(
        form.elements.name.value,
        form.elements.email.value,
        form.elements.password.value
      );
    } else {
      await login(
        form.elements.email.value,
        form.elements.password.value
      );
    }

    window.location.assign('/public/pages/perfil.html');
  } catch (error) {
    message.textContent = error instanceof DOMException
      ? 'No se pudo acceder a la cuenta. Usa un servidor local y permite el almacenamiento.'
      : error.message;
  } finally {
    submit.disabled = false;
    tabs.forEach(tab => {
      tab.disabled = false;
    });
  }
});