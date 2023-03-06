/* eslint-disable */
// import '@babel/polyfill';
import { login, logout } from './login.js';
import displayMap from './mapBox.js';
import updateSettings from './updateSettings.js';
import bookTour from './stripe.js';

// DOM ELEMENT
const loginFormEl = document.querySelector('.form');
const mapEl = document.querySelector('#map');
const logoutEl = document.querySelector('.nav__el--logout');
const SaveSettingsFormEl = document.querySelector('.form-user-data');
const SavePasswordFormEl = document.querySelector('.form-user-settings');
const bookTourBtnEl = document.querySelector('#btn-bookTour');

// DELEGATION
if (mapEl) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}

// LOGIN EVENT
if (loginFormEl && loginFormEl.closest('.login-form'))
  loginFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    login(password, email);
  });

// LOGOUT EVENT
if (logoutEl) logoutEl.addEventListener('click', logout);

// UPDATE USER SETTINGS
if (SaveSettingsFormEl)
  SaveSettingsFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.textContent = 'UPDATING...';
    const data = new FormData();
    data.append('name', document.getElementById('name').value);
    data.append('email', document.getElementById('email').value);

    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) data.append('photo', photoFile);

    const updateOptions = {
      data,
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      method: 'patch',
    };
    await updateSettings(updateOptions);
    e.submitter.textContent = 'SAVE SETTINGS';
  });

// UPDATE USER　PASSWORD
if (SavePasswordFormEl)
  SavePasswordFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.textContent = 'UPDATING...';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const updateOptions = {
      data: { currentPassword, password, passwordConfirm },
      url: 'http://127.0.0.1:3000/api/v1/users/updatePassword',
      method: 'patch',
    };
    await updateSettings(updateOptions);
    e.submitter.textContent = 'SAVE PASSWORD';
    [...e.target].forEach((el) => (el.value = ''));
  });

// BOOKING TOUR
if (bookTourBtnEl)
  bookTourBtnEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.target.textContent = 'PROCESSING...';
    bookTour(e.target.dataset.tourId);
  });
