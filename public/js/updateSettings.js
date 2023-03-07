/* eslint-disable */
import showAlert from './alert.js';

export default async (udpateOptions) => {
  try {
    const { data } = await axios({
      url: udpateOptions.url,
      method: udpateOptions.method,
      data: udpateOptions.data,
    });
    if (data.status === 'success') {
      showAlert('success', 'Update successfully');
      setTimeout(() => window.location.reload(true), 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
