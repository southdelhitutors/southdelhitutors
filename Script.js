let isTicking = false;

function handleScroll() {
  const winScroll = window.scrollY || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = height > 0 ? winScroll / height : 0;
  const progressBar = document.getElementById('progressBar');
  if (progressBar) progressBar.style.transform = `scaleX(${scrolled})`;

  const sections = ['home', 'about', 'expertise', 'frameworks', 'governance', 'credentials', 'contact'];
  const sectionTracker = document.getElementById('sectionTracker');
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    let navLinkId = 'nav-' + sectionId;
    if (['frameworks', 'governance', 'credentials'].includes(sectionId)) navLinkId = 'nav-expertise';
    const navLink = document.getElementById(navLinkId);
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 250 && rect.bottom >= 250) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active-section'));
        if (navLink) navLink.classList.add('active-section');
        if (sectionTracker) sectionTracker.innerText = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
      }
    }
  });
  isTicking = false;
}

window.addEventListener('scroll', () => {
  if (!isTicking) {
    window.requestAnimationFrame(handleScroll);
    isTicking = true;
  }
}, { passive: true });

document.addEventListener('DOMContentLoaded', handleScroll);

const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function formatSlotTime(time) {
  const [hour, minute] = time.split(':').map(Number);
  const suffix = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')}${suffix}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekNumber(date, firstSunday) {
  const daysSinceFirstSunday = Math.floor((date - firstSunday) / 86400000);
  return Math.floor(daysSinceFirstSunday / 7) + 1;
}

function selectAppointmentSlot(date, time) {
  const dateInput = document.getElementById('appointment-date');
  const timeInput = document.getElementById('appointment-time');
  if (dateInput) dateInput.value = toDateValue(date);
  if (timeInput) timeInput.value = time;

  document.querySelectorAll('.slot-button.is-selected').forEach(button => button.classList.remove('is-selected'));
  const selectedButton = document.querySelector(`[data-date="${toDateValue(date)}"][data-time="${time}"]`);
  if (selectedButton) selectedButton.classList.add('is-selected');

  const selectionSummary = document.getElementById('selectionSummary');
  if (selectionSummary) selectionSummary.textContent = `Selected: ${weekdayNames[date.getDay()]}, ${formatDate(date)} at ${formatSlotTime(time)}`;
  closeAvailabilityModal();
}

function renderAppointmentSlots(slotData) {
  const availabilityList = document.getElementById('availabilityList');
  if (!availabilityList) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstSunday = new Date(today);
  firstSunday.setDate(today.getDate() - today.getDay());
  const dates = [];
  const timeValues = new Set();
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dayIndex = date.getDay();
    const weekNumber = getWeekNumber(date, firstSunday);
    const slotKey = `${weekdayKeys[dayIndex]}${weekNumber}`;
    const slots = slotData.weeks[slotKey] || [];
    dates.push({ date, slots });
    slots.forEach(slot => timeValues.add(slot.time));
  }

  const calendar = document.createElement('div');
  calendar.className = 'availability-calendar-scroll';
  const calendarGrid = document.createElement('div');
  calendarGrid.className = 'availability-calendar';
  calendarGrid.style.setProperty('--calendar-days', dates.length);

  const blankHeader = document.createElement('div');
  blankHeader.className = 'calendar-time-heading';
  blankHeader.textContent = 'Time';
  calendarGrid.appendChild(blankHeader);

  dates.forEach(({ date }) => {
    const dateHeading = document.createElement('div');
    dateHeading.className = 'calendar-date-heading';
    dateHeading.innerHTML = `<strong>${weekdayNames[date.getDay()]}</strong><span>${formatDate(date)}</span>`;
    calendarGrid.appendChild(dateHeading);
  });

  [...timeValues].sort().forEach(time => {
    const timeHeading = document.createElement('div');
    timeHeading.className = 'calendar-time';
    timeHeading.textContent = formatSlotTime(time);
    calendarGrid.appendChild(timeHeading);

    dates.forEach(({ date, slots }) => {
      const slot = slots.find(availableSlot => availableSlot.time === time);
      const slotCell = document.createElement('div');
      slotCell.className = 'calendar-slot-cell';
      if (!slot) {
        slotCell.classList.add('is-empty');
        slotCell.textContent = '—';
        calendarGrid.appendChild(slotCell);
        return;
      }

      const isAvailable = slot.status === 'avail';
      const slotButton = document.createElement('button');
      slotButton.className = `slot-button${isAvailable ? '' : ' is-unavailable'}`;
      slotButton.type = 'button';
      slotButton.disabled = !isAvailable;
      slotButton.textContent = isAvailable ? 'Avail' : 'Booked';
      slotButton.dataset.date = toDateValue(date);
      slotButton.dataset.time = slot.time;
      if (isAvailable) slotButton.addEventListener('click', () => selectAppointmentSlot(date, slot.time));
      slotCell.appendChild(slotButton);
      calendarGrid.appendChild(slotCell);
    });
  });

  calendar.appendChild(calendarGrid);
  availabilityList.replaceChildren(calendar);
}

async function loadAppointmentSlots() {
  const availabilityList = document.getElementById('availabilityList');
  if (!availabilityList) return;

  if (window.appointmentSlots && window.appointmentSlots.weeks) {
    renderAppointmentSlots(window.appointmentSlots);
    return;
  }

  availabilityList.innerHTML = '<p class="availability-error mb-0">Appointment data could not be loaded. Please contact us on WhatsApp.</p>';
}

document.addEventListener('DOMContentLoaded', loadAppointmentSlots);

function openAvailabilityModal() {
  const modal = document.getElementById('availabilityModal');
  if (!modal) return;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-open'));
  document.body.classList.add('modal-open');
  modal.querySelector('.availability-modal-close').focus();
}

function closeAvailabilityModal() {
  const modal = document.getElementById('availabilityModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
  window.setTimeout(() => {
    if (!modal.classList.contains('is-open')) modal.hidden = true;
  }, 220);
}

function setupFocusDropdown() {
  const select = document.getElementById('focusSelect');
  const toggle = document.getElementById('focusToggle');
  const menu = document.getElementById('focusMenu');
  const label = document.getElementById('focusLabel');
  const input = document.getElementById('focus');
  if (!select || !toggle || !menu || !label || !input) return;

  function closeMenu() {
    select.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }

  toggle.addEventListener('click', () => {
    const isOpen = !select.classList.contains('is-open');
    select.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    menu.hidden = !isOpen;
  });

  menu.querySelectorAll('.custom-select-option').forEach(option => {
    option.addEventListener('click', () => {
      input.value = option.dataset.value;
      label.textContent = option.textContent;
      menu.querySelectorAll('.custom-select-option').forEach(item => {
        item.classList.remove('is-selected');
        item.setAttribute('aria-selected', 'false');
      });
      option.classList.add('is-selected');
      option.setAttribute('aria-selected', 'true');
      closeMenu();
    });
  });

  document.addEventListener('click', event => {
    if (!select.contains(event.target)) closeMenu();
  });
}

function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.querySelector(`[data-error-for="${fieldId}"]`);
  const visualField = fieldId === 'appointment-date' ? document.getElementById('openAvailabilityButton') : field;
  if (error) error.textContent = message;
  if (visualField) visualField.classList.toggle('has-error', Boolean(message));
}

function setupFormValidation() {
  const form = document.querySelector('.appointment-form');
  if (!form) return;

  form.addEventListener('submit', event => {
    const fields = [
      ['full-name', 'Please enter your full name.'],
      ['email', 'Please enter a valid email address.'],
      ['whatsapp', 'Please enter your WhatsApp number.'],
      ['appointment-date', 'Please choose an available appointment time.'],
      ['message', 'Please tell us what you would like to discuss.']
    ];
    let isValid = true;
    let firstInvalidField = null;

    fields.forEach(([fieldId, message]) => {
      const field = document.getElementById(fieldId);
      const value = field ? field.value.trim() : '';
      const isEmail = fieldId === 'email';
      const validEmail = !isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const fieldIsValid = Boolean(value) && validEmail;
      setFieldError(fieldId, fieldIsValid ? '' : message);
      if (!fieldIsValid) {
        isValid = false;
        if (!firstInvalidField) firstInvalidField = fieldId;
      }
    });

    if (!isValid) {
      event.preventDefault();
      if (firstInvalidField === 'appointment-date') openAvailabilityModal();
      else document.getElementById(firstInvalidField).focus();
    }
  });

  form.querySelectorAll('.form-control').forEach(field => {
    field.addEventListener('input', () => setFieldError(field.id, ''));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const openButton = document.getElementById('openAvailabilityButton');
  if (openButton) openButton.addEventListener('click', openAvailabilityModal);

  document.querySelectorAll('[data-close-availability]').forEach(element => {
    element.addEventListener('click', closeAvailabilityModal);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeAvailabilityModal();
  });

  setupFocusDropdown();
  setupFormValidation();
});