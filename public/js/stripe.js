/* eslint-disable */
import showAlert from './alert.js';

const stripe = new Stripe(
  'pk_test_51Mhz3PDTMDxOVQFfUI8J3c3VdVKD4nAWJwv29yRIk3GvuFrjAyIpBeBx5uSuMV0Snivs4eZwKpNBbQvD5u5LsVAL00Y8puRU2J'
);

export default async (tourId) => {
  try {
    // 1) Get checkout session from api
    const session = await axios({
      method: 'get',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
    });

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    // window.location.replace(session.data.session.url);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
