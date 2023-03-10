/* eslint-disable */
import showAlert from './alert.js';

export const login = async (password, email) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: '/api/v1/users/login',
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
      url: '/api/v1/users/logout',
    });
    if (data.status === 'success') {
      setTimeout(() => window.location.reload(true), 200);
    }
  } catch (err) {
    showAlert('error', 'Error logout. Please try again');
  }
};
