import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must have a tour'],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must have a user'],
  },

  price: { type: Number, required: [true, 'A booking must have a parice'] },

  paid: { type: Boolean, default: true },

  createdAt: { type: Date, default: new Date() },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: { name: 1 },
  }).populate({ path: 'user', select: { name: 1 } });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
