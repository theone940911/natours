/* eslint-disable */
import showAlert from './alert.js';

export const login = async (password, email) => {
  console.log('✨');
  try {
    const { data } = await axios({
      method: 'post',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: { email, password },
    });
    if (data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      setTimeout(() => window.location.assign('/'), 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const { data } = await axios({
      method: 'get',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    console.log(data);
    if (data.status === 'success') {
      setTimeout(() => window.location.reload(true), 200);
    }
  } catch (err) {
    showAlert('error', 'Error logout. Please try again');
  }
};
