const fs = require('fs');
const path = require('path');

const STORAGE_PATH = path.join(__dirname, 'verify_storage.json');

function readStorage() {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      return JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf8'));
    }
    return {};
  } catch (e) {
    console.error('read err', e);
    return {};
  }
}

function writeStorage(data) {
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('write err', e);
  }
}

function generateReqId(existing) {
  const year = new Date().getFullYear();
  const last = (existing || []).map(r => {
    const m = (r.id || '').match(/REQ-(\d{4})-(\d{4})/);
    return m ? parseInt(m[2], 10) : 0;
  }).sort((a,b)=>b-a)[0] || 0;
  const next = (last || 0) + 1;
  return `REQ-${year}-${String(next).padStart(4,'0')}`;
}

function generateActivityId() {
  return `ACT-${Date.now()}-${Math.random().toString(36).substr(2,6)}`;
}

function generateAttachmentId() {
  return `ATT-${Date.now()}-${Math.random().toString(36).substr(2,6)}`;
}

function nowIso(){ return new Date().toISOString(); }

// Simulate creating a request and booking an appointment
const store = readStorage();
store.kcws_quote_requests = store.kcws_quote_requests || [];
store.kcws_booking_appointments_v1 = store.kcws_booking_appointments_v1 || [];
store.kcws_booking_activity_v1 = store.kcws_booking_activity_v1 || [];
store.kcws_booking_attachments_v1 = store.kcws_booking_attachments_v1 || [];

// Create a new request
const newReqId = generateReqId(store.kcws_quote_requests);
const request = {
  id: newReqId,
  serviceType: 'Small Business Website',
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  customerPhone: '555-1234',
  addressLine1: '123 Demo St',
  addressLine2: '',
  city: 'Demo City',
  state: 'CA',
  zip: '90210',
  details: 'Please provide a simple landing page for our local business with contact form and map.',
  preferredDateFrom: null,
  preferredDateTo: null,
  createdAt: nowIso(),
  status: 'Submitted',
};
store.kcws_quote_requests.push(request);

// Log Created activity
store.kcws_booking_activity_v1.push({
  id: generateActivityId(),
  requestId: newReqId,
  type: 'Created',
  message: 'Request created via automated verification script',
  timestamp: nowIso(),
});

// Create an appointment for 2 days from now at 10:00
const apptDate = new Date(); apptDate.setDate(apptDate.getDate()+2);
const apptIso = apptDate.toISOString().slice(0,10);
const appointment = {
  requestId: newReqId,
  date: apptIso,
  time: '10:00',
  status: 'booked',
  createdAt: nowIso(),
};
store.kcws_booking_appointments_v1.push(appointment);

// Update request to attach appointment and status
const idx = store.kcws_quote_requests.findIndex(r => r.id === newReqId);
if (idx !== -1) {
  store.kcws_quote_requests[idx].appointment = { date: appointment.date, time: appointment.time, status: appointment.status, createdAt: appointment.createdAt };
  store.kcws_quote_requests[idx].status = 'Scheduled';
  store.kcws_quote_requests[idx].updatedAt = nowIso();
}

// Log Appointment Booked
store.kcws_booking_activity_v1.push({
  id: generateActivityId(),
  requestId: newReqId,
  type: 'AppointmentBooked',
  message: `Appointment booked for ${appointment.date} ${appointment.time}`,
  timestamp: nowIso(),
});

// Add a mock attachment
const attachment = {
  id: generateAttachmentId(),
  requestId: newReqId,
  filename: 'brief.pdf',
  size: 12345,
  uploadedAt: nowIso(),
};
store.kcws_booking_attachments_v1.push(attachment);
store.kcws_booking_activity_v1.push({ id: generateActivityId(), requestId: newReqId, type: 'AttachmentAdded', message: 'Added mock attachment brief.pdf', timestamp: nowIso() });

writeStorage(store);

console.log('Created request:', newReqId);
console.log('Appointment:', appointment.date, appointment.time);
console.log('Attachment id:', attachment.id);
console.log('\nStorage snapshot:');
console.log(JSON.stringify(store, null, 2));

console.log('\nTo view this in the running app, open http://localhost:4200/demos/service-booking/customer and look for Request ID', newReqId);
