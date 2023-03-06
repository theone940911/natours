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

// export const updatePassword = async (
//   currentPassword,
//   password,
//   passwordConfirm
// ) => {
//   console.log('✨✨');
//   try {
//     const { data } = await axios({
//       url: 'http://127.0.0.1:3000/api/v1/users/updatePassword',
//       method: 'patch',
//       data: { currentPassword, password, passwordConfirm },
//     });
//     if (data.status === 'Success') {
//       showAlert('success', 'Update successfully');
//       setTimeout(() => {
//         window.location.reload(true);
//       }, 1500);
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };
