const fs = require('fs');
const path = require('path');

function dateHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

function getAvailableSlots(dateIso) {
  const date = new Date(dateIso + 'T00:00:00');
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;
  const slots = [];
  if (isWeekend) return slots;
  const startHour = 9;
  const endHour = 16;
  const times = [];
  for (let h = startHour; h < endHour; h++) {
    times.push(`${String(h).padStart(2,'0')}:00`);
    times.push(`${String(h).padStart(2,'0')}:30`);
  }
  times.pop();
  const lunchSet = new Set(['12:00','12:30']);
  const seed = dateHash(dateIso);
  const rng = (i) => ((seed >> i) & 0xff) / 255;
  const blockCount = 2 + (seed % 3);
  const blockedIdx = [];
  let i = 0;
  while (blockedIdx.length < blockCount && i < times.length) {
    const idx = Math.floor(rng(i) * times.length);
    if (!blockedIdx.includes(idx) && !lunchSet.has(times[idx])) blockedIdx.push(idx);
    i++;
  }
  const now = new Date();
  const todayIso = now.toISOString().slice(0,10);
  for (let t of times) {
    let available = true;
    let reason;
    if (lunchSet.has(t)) { available = false; reason = 'Lunch'; }
    const idx = times.indexOf(t);
    if (blockedIdx.includes(idx)) { available = false; reason = 'Unavailable'; }
    if (dateIso === todayIso) {
      const [hh, mm] = t.split(':').map(s=>parseInt(s,10));
      const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
      if (slotDate <= now) { available = false; reason = 'Past'; }
    }
    slots.push({time: t, available, reason});
  }
  return slots;
}

function saveAppointmentMock(storagePath, appointment) {
  let data = {};
  try {
    if (fs.existsSync(storagePath)) data = JSON.parse(fs.readFileSync(storagePath,'utf8')) || {};
  } catch(e) { console.error('read err', e); }
  data['kcws_booking_appointments_v1'] = data['kcws_booking_appointments_v1'] || [];
  data['kcws_booking_appointments_v1'].push(appointment);
  fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
}

function readStorageMock(storagePath) {
  try {
    if (!fs.existsSync(storagePath)) return {};
    return JSON.parse(fs.readFileSync(storagePath,'utf8'));
  } catch(e) {
    console.error('read err', e);
    return {};
  }
}

const storagePath = path.join(__dirname, 'verify_storage.json');
const today = new Date().toISOString().slice(0,10);
const sampleDate = process.argv[2] || today;

console.log('Checking slots for', sampleDate);
const slots = getAvailableSlots(sampleDate);
console.log('Total slots:', slots.length);
const avail = slots.filter(s=>s.available).length;
console.log('Available:', avail, 'Unavailable:', slots.length - avail);
console.log('Sample slots (first 8):');
console.log(slots.slice(0,8));

// simulate saving an appointment
const appt = {
  requestId: 'REQ-2025-TEST',
  date: sampleDate,
  time: slots.find(s=>s.available)?.time || '09:00',
  status: 'booked',
  createdAt: new Date().toISOString()
};
console.log('Saving appointment:', appt);
saveAppointmentMock(storagePath, appt);

console.log('Storage file written to', storagePath);
console.log('Current storage contents:');
console.log(JSON.stringify(readStorageMock(storagePath), null, 2));

console.log('Done. To verify in-browser, open the app and inspect localStorage key `kcws_booking_appointments_v1`.');
