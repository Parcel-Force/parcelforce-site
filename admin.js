// admin.js
import { db } from './firebase.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

window.submitParcel = function () {
  const trackingNumber = document.getElementById('trackingNumber').value.trim();
  const sender = document.getElementById('sender').value.trim();
  const receiver = document.getElementById('receiver').value.trim();
  const address = document.getElementById('address').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const deliveryFee = parseFloat(document.getElementById('deliveryFee').value);
  const estimatedDelivery = document.getElementById('estimatedDelivery').value;
  const statusRaw = document.getElementById('status').value.trim();
  const latitude = parseFloat(document.getElementById('latitude').value);
  const longitude = parseFloat(document.getElementById('longitude').value);
  const feedback = document.getElementById('feedback');

  if (!trackingNumber || !sender || !receiver || !address || !deliveryFee || !estimatedDelivery || !statusRaw) {
    feedback.style.color = 'red';
    feedback.textContent = "Please fill in all required fields.";
    return;
  }

  let status;
  try {
    status = statusRaw.split('\n').map((line, index) => {
      const parts = line.split('|').map(s => s.trim());
      if (parts.length !== 4) {
        throw new Error(`Line ${index + 1} is incorrectly formatted.`);
      }
      const [timestamp, location, statusText, details] = parts;
      return {
        timestamp: timestamp || new Date().toISOString(),
        location,
        status: statusText,
        details,
        latitude,
        longitude
      };
    });
  } catch (err) {
    feedback.style.color = 'red';
    feedback.textContent = err.message;
    return;
  }

  const parcelData = {
    sender,
    receiver,
    address,
    phone,
    email,
    deliveryFee,
    estimatedDelivery,
    status
  };

  const parcelRef = ref(db, 'parcels/' + trackingNumber);
  set(parcelRef, parcelData)
    .then(() => {
      feedback.style.color = 'green';
      feedback.textContent = "Parcel added successfully!";
    })
    .catch((error) => {
      console.error(error);
      feedback.style.color = 'red';
      feedback.textContent = "Error adding parcel.";
    });
};
