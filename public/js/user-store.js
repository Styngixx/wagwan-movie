// Demo académica: cuentas guardadas en este navegador.
const KEY = 'wagwan.users.v1';
const SESSION = 'wagwan.user.session.v1';

export function users() {
  const data = JSON.parse(localStorage.getItem(KEY) || '[]');
  if (!Array.isArray(data)) {
    throw new Error('Los datos locales no son válidos.');
  }
  return data;
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function currentUser() {
  const id = sessionStorage.getItem(SESSION);
  return id ? users().find(user => user.id === id) || null : null;
}

export function logout() {
  sessionStorage.removeItem(SESSION);
}

async function digest(password, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 210000,
      hash: 'SHA-256'
    },
    key,
    256
  );

  return Array.from(new Uint8Array(bits), byte =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

function validate(name, email) {
  if (name.length < 2 || name.length > 60) {
    throw new Error('Escribe un nombre de 2 a 60 caracteres.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Escribe un correo válido.');
  }
}

export async function register(name, email, password) {
  name = name.trim();
  email = email.trim().toLowerCase();
  validate(name, email);

  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.');
  }

  const list = users();
  if (list.some(user => user.email === email)) {
    throw new Error('Este correo ya tiene una cuenta. Inicia sesión.');
  }

  const salt = crypto.randomUUID();
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    salt,
    hash: await digest(password, salt),
    bio: '',
    genre: 'Acción',
    color: '#2563eb',
    createdAt: new Date().toISOString()
  };

  save([...list, user]);
  sessionStorage.setItem(SESSION, user.id);
  return user;
}

export async function login(email, password) {
  const user = users().find(
    item => item.email === email.trim().toLowerCase()
  );

  if (!user || await digest(password, user.salt) !== user.hash) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  sessionStorage.setItem(SESSION, user.id);
  return user;
}

export function updateProfile({ name, email, bio, genre, color }) {
  const user = currentUser();
  if (!user) {
    throw new Error('Inicia sesión nuevamente.');
  }

  name = name.trim();
  email = email.trim().toLowerCase();
  bio = bio.trim();
  validate(name, email);

  if (bio.length > 240) {
    throw new Error('La biografía admite hasta 240 caracteres.');
  }

  const list = users();
  if (list.some(item => item.id !== user.id && item.email === email)) {
    throw new Error('Ese correo pertenece a otra cuenta.');
  }

  const updated = { ...user, name, email, bio, genre, color };
  save(list.map(item => item.id === user.id ? updated : item));
  return updated;
}