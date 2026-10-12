const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({ from: `"Shipment Tracker" <${process.env.EMAIL_USER}>`, to, subject, html });
  } catch (err) {
    console.error("Email error:", err.message);
  }
};

const shipmentCreatedEmail = (receiver, trackingId) => ({
  to: receiver.email,
  subject: "Your Shipment Has Been Created",
  html: `<h2>Shipment Created</h2>
         <p>Hello ${receiver.name},</p>
         <p>Your shipment has been created with tracking ID: <strong>${trackingId}</strong></p>
         <p>Track your shipment at: <a href="${process.env.FRONTEND_URL}/track/${trackingId}">${process.env.FRONTEND_URL}/track/${trackingId}</a></p>`,
});

const statusUpdateEmail = (receiver, trackingId, status) => ({
  to: receiver.email,
  subject: `Shipment Update: ${status}`,
  html: `<h2>Shipment Status Update</h2>
         <p>Hello ${receiver.name},</p>
         <p>Your shipment <strong>${trackingId}</strong> status has been updated to: <strong>${status}</strong></p>
         <p>Track your shipment at: <a href="${process.env.FRONTEND_URL}/track/${trackingId}">${process.env.FRONTEND_URL}/track/${trackingId}</a></p>`,
});

const deliveryOTPEmail = (receiver, trackingId, otp) => ({
  to: receiver.email,
  subject: "Delivery OTP Verification",
  html: `<h2>Delivery OTP</h2>
         <p>Hello ${receiver.name},</p>
         <p>Your delivery OTP for shipment <strong>${trackingId}</strong> is: <strong style="font-size:24px">${otp}</strong></p>
         <p>This OTP expires in 10 minutes.</p>`,
});

const deliveryConfirmedEmail = (receiver, trackingId) => ({
  to: receiver.email,
  subject: "Shipment Delivered Successfully",
  html: `<h2>Shipment Delivered</h2>
         <p>Hello ${receiver.name},</p>
         <p>Your shipment <strong>${trackingId}</strong> has been delivered successfully.</p>`,
});

module.exports = { sendEmail, shipmentCreatedEmail, statusUpdateEmail, deliveryOTPEmail, deliveryConfirmedEmail };
