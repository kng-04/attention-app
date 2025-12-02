document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'timesheetEntries';
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timesheetBody = document.getElementById('timesheetBody');
  const weeklyTotalEl = document.getElementById('weeklyTotal');
  const weeklyBreakdownEl = document.getElementById('weeklyBreakdown');
  const clearBtn = document.getElementById('clearTimesheetBtn');

  if (!timesheetBody || !weeklyTotalEl) {
    return;
  }

  const savedEntries = safeParse(localStorage.getItem(storageKey));
  const savedPeriod = savedEntries._period || {};
  delete savedEntries._period;
  const entries = { ...savedEntries };
  const dayTotals = {};
  let fieldMap = {};
  const periodStartInput = document.getElementById('periodStart');
  const periodEndInput = document.getElementById('periodEnd');
  const savePdfBtn = document.getElementById('savePdfBtn');
  const periodHint = document.getElementById('periodHint');

  if (periodStartInput && savedPeriod.start) {
    periodStartInput.value = normalizeDateValue(savedPeriod.start);
  }
  if (periodEndInput && savedPeriod.end) {
    periodEndInput.value = normalizeDateValue(savedPeriod.end);
  }

  renderTimesheet();
  updateWeeklyTotal();
  updatePeriodHintVisibility();

  periodStartInput?.addEventListener('change', () => {
    normalizeDateInput(periodStartInput);
    persistEntries();
    renderTimesheet();
    updatePeriodHintVisibility();
  });
  periodEndInput?.addEventListener('change', () => {
    normalizeDateInput(periodEndInput);
    persistEntries();
    renderTimesheet();
    updatePeriodHintVisibility();
  });
  savePdfBtn?.addEventListener('click', handleSavePdf);

  clearBtn?.addEventListener('click', () => {
    if (!window.confirm('Clear all entries for this week? This cannot be undone.')) {
      return;
    }

    Object.keys(fieldMap).forEach((dayKey) => {
      const { startInput, endInput, offInput, totalEl, breakdownEl } = fieldMap[dayKey];
      startInput.value = '';
      endInput.value = '';
      offInput.checked = false;
      startInput.disabled = false;
      endInput.disabled = false;
      toggleBreakControls(dayKey, false, { reset: true });
      totalEl.textContent = '—';
      if (breakdownEl) {
        breakdownEl.textContent = '0 h 0 mins';
      }
    });

    if (periodStartInput) periodStartInput.value = '';
    if (periodEndInput) periodEndInput.value = '';

    Object.keys(dayTotals).forEach((key) => delete dayTotals[key]);
    Object.keys(entries).forEach((key) => delete entries[key]);
    localStorage.removeItem(storageKey);
    renderTimesheet();
    updateWeeklyTotal();
    updatePeriodHintVisibility();
    persistEntries();
  });

  function renderTimesheet() {
    timesheetBody.innerHTML = '';
    fieldMap = {};
    Object.keys(dayTotals).forEach((key) => delete dayTotals[key]);
    const rows = getDisplayRange();

    rows.forEach((rowInfo) => {
      const rowKey = rowInfo.key;
      const row = document.createElement('tr');
      row.dataset.key = rowKey;
      row.innerHTML = `
        <th scope="row">
          <div class="day-name">
            <span class="day-label" data-day-label="${rowKey}">${rowInfo.dayName}</span>
            <span class="day-date" data-day-date="${rowKey}">${rowInfo.displayDate}</span>
          </div>
        </th>
        <td class="off-cell">
          <label class="off-toggle">
            <input type="checkbox" data-field="off" aria-label="${rowInfo.dayName} didn't work" />
          </label>
        </td>
        <td><input type="time" data-field="start" aria-label="${rowInfo.dayName} start time" /></td>
        <td><input type="time" data-field="end" aria-label="${rowInfo.dayName} end time" /></td>
        <td>
          <div class="break-cell">
            <div class="break-fields"></div>
            <button type="button" class="add-break-btn" aria-label="Add break for ${rowInfo.dayName}">+</button>
          </div>
        </td>
        <td>
          <div class="daily-total-block">
            <span class="daily-total">—</span>
            <small class="daily-breakdown">0 h 0 mins</small>
          </div>
        </td>
      `;

      const startInput = row.querySelector('input[data-field="start"]');
      const endInput = row.querySelector('input[data-field="end"]');
      const breakContainer = row.querySelector('.break-fields');
      const addBreakBtn = row.querySelector('.add-break-btn');
      const offInput = row.querySelector('input[data-field="off"]');
      const totalEl = row.querySelector('.daily-total');
      const breakdownEl = row.querySelector('.daily-breakdown');
      const dayLabelEl = row.querySelector(`[data-day-label="${rowKey}"]`);
      const dateLabelEl = row.querySelector(`[data-day-date="${rowKey}"]`);

      fieldMap[rowKey] = {
        startInput,
        endInput,
        breakContainer,
        addBreakBtn,
        offInput,
        totalEl,
        breakdownEl,
        dayLabel: dayLabelEl,
        dateLabel: dateLabelEl,
        defaultLabel: rowInfo.dayName
      };

      // Restore previous values if they exist.
      const saved = entries[rowKey];
      let savedBreaks = [];
      if (saved) {
        if (saved.off) {
          offInput.checked = true;
        } else {
          startInput.value = saved.start || '';
          endInput.value = saved.end || '';
          if (Array.isArray(saved.breaks)) {
            savedBreaks = saved.breaks;
          } else if (typeof saved.break === 'string' && saved.break !== '') {
            savedBreaks = [saved.break];
          }
        }
      }

      if (!savedBreaks.length) {
        addBreakInput(rowKey);
      } else {
        savedBreaks.forEach((value) => addBreakInput(rowKey, value));
      }

      const handleChange = () => updateDayTotals(rowKey);
      startInput.addEventListener('input', handleChange);
      endInput.addEventListener('input', handleChange);
      addBreakBtn.addEventListener('click', () => {
        if (!canAddBreak(rowKey)) {
          alert('Please enter the current break duration before adding another.');
          return;
        }
        const input = addBreakInput(rowKey);
        input?.focus();
      });
      offInput.addEventListener('change', () => handleOffToggle(rowKey));

      timesheetBody.appendChild(row);
      if (offInput.checked) {
        handleOffToggle(rowKey, { skipPersist: true });
      } else {
        updateDayTotals(rowKey);
      }
    });
  }

  function handleOffToggle(dayKey, options = {}) {
    const { startInput, endInput, offInput, totalEl, breakdownEl } = fieldMap[dayKey];
    const { skipPersist = false } = options;

    if (offInput.checked) {
      startInput.value = '';
      endInput.value = '';
      startInput.disabled = true;
      endInput.disabled = true;
      toggleBreakControls(dayKey, true, { reset: true });
      totalEl.textContent = '—';
      if (breakdownEl) breakdownEl.textContent = '0 h 0 mins';
      delete dayTotals[dayKey];
      entries[dayKey] = { off: true };
      if (!skipPersist) {
        persistEntries();
        updateWeeklyTotal();
      }
      return;
    }

    startInput.disabled = false;
    endInput.disabled = false;
    toggleBreakControls(dayKey, false);

    if (entries[dayKey]) {
      delete entries[dayKey].off;
    }

    updateDayTotals(dayKey);
  }

  function updateDayTotals(dayKey) {
    const { startInput, endInput, offInput, totalEl, breakdownEl } = fieldMap[dayKey];
    const breakInputs = getBreakInputs(dayKey);

    if (offInput.checked) {
      totalEl.textContent = '—';
      if (breakdownEl) breakdownEl.textContent = '0 h 0 mins';
      delete dayTotals[dayKey];
      entries[dayKey] = { off: true };
      persistEntries();
      updateWeeklyTotal();
      return;
    }
    const start = startInput.value;
    const end = endInput.value;
    const breakMinutes = breakInputs.reduce((sum, input) => {
      const value = parseInt(input.value, 10);
      return Number.isNaN(value) ? sum : sum + value;
    }, 0);
    const breakHours = Number.isNaN(breakMinutes) ? 0 : breakMinutes / 60;
    const hoursWorked = calculateHours(start, end, breakHours);

    if (hoursWorked === null) {
      totalEl.textContent = '—';
      delete dayTotals[dayKey];
    } else {
      totalEl.textContent = `${hoursWorked.toFixed(2)} hrs`;
      if (breakdownEl) {
        const totalMinutes = Math.round(hoursWorked * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        breakdownEl.textContent = `${hours} h ${minutes} mins`;
      }
      dayTotals[dayKey] = hoursWorked;
    }

    const breakValues = breakInputs
      .map((input) => input.value.trim())
      .filter((value) => value !== '');

    if (start || end || breakValues.length) {
      const data = { start, end };
      if (breakValues.length) {
        data.breaks = breakValues;
      }
      entries[dayKey] = data;
    } else {
      delete entries[dayKey];
    }

    persistEntries();
    updateWeeklyTotal();
  }

  function addBreakInput(dayKey, value = '') {
    const mapping = fieldMap[dayKey];
    if (!mapping?.breakContainer) {
      return null;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'break-field';

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '1';
    input.placeholder = '0';
    input.value = value;
    input.inputMode = 'numeric';
    input.pattern = '[0-9]*';
    input.addEventListener('input', () => {
      const sanitized = input.value.replace(/\D+/g, '');
      if (input.value !== sanitized) {
        input.value = sanitized;
      }
      updateDayTotals(dayKey);
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-break-btn';
    removeBtn.setAttribute('aria-label', 'Remove break');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      const totalFields = mapping.breakContainer.querySelectorAll('.break-field').length;
      if (totalFields <= 1) {
        input.value = '';
        updateDayTotals(dayKey);
        return;
      }
      wrapper.remove();
      updateBreakButtonsState(dayKey);
      updateDayTotals(dayKey);
    });

    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    mapping.breakContainer.appendChild(wrapper);
    updateBreakButtonsState(dayKey);
    return input;
  }

  function getBreakInputs(dayKey) {
    const mapping = fieldMap[dayKey];
    if (!mapping?.breakContainer) {
      return [];
    }
    return Array.from(mapping.breakContainer.querySelectorAll('.break-field input'));
  }

  function resetBreakInputs(dayKey) {
    const mapping = fieldMap[dayKey];
    if (!mapping?.breakContainer) {
      return;
    }
    mapping.breakContainer.innerHTML = '';
    addBreakInput(dayKey);
    updateBreakButtonsState(dayKey);
  }

  function toggleBreakControls(dayKey, disabled, options = {}) {
    const { reset = false, preserve = false } = options;
    const mapping = fieldMap[dayKey];
    if (!mapping) {
      return;
    }

    if (reset) {
      resetBreakInputs(dayKey);
    }

    const inputs = getBreakInputs(dayKey);
    inputs.forEach((input) => {
      input.disabled = disabled;
      if (disabled && !preserve) {
        input.value = '';
      }
    });

    if (!inputs.length && !disabled) {
      addBreakInput(dayKey);
    }

    if (mapping.addBreakBtn) {
      mapping.addBreakBtn.disabled = disabled;
    }

    updateBreakButtonsState(dayKey);
  }

  function canAddBreak(dayKey) {
    const inputs = getBreakInputs(dayKey);
    if (!inputs.length) {
      return true;
    }
    const lastValue = inputs[inputs.length - 1].value.trim();
    return lastValue !== '' && !Number.isNaN(parseInt(lastValue, 10));
  }

  function updateBreakButtonsState(dayKey) {
    const mapping = fieldMap[dayKey];
    if (!mapping?.breakContainer) {
      return;
    }
    const fields = mapping.breakContainer.querySelectorAll('.break-field');
    const removeButtons = mapping.breakContainer.querySelectorAll('.remove-break-btn');
    removeButtons.forEach((btn) => {
      const hide = !!(mapping.addBreakBtn?.disabled) || fields.length <= 1;
      btn.disabled = hide;
      btn.style.visibility = hide ? 'hidden' : 'visible';
    });
  }

  function updateWeeklyTotal() {
    const weeklyTotal = Object.values(dayTotals).reduce((sum, hours) => sum + hours, 0);
    weeklyTotalEl.textContent = weeklyTotal > 0 ? weeklyTotal.toFixed(2) : '0.00';

    if (weeklyBreakdownEl) {
      const totalMinutes = Math.round(weeklyTotal * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      weeklyBreakdownEl.textContent = `${hours} h ${minutes} mins`;
    }
  }

  function getPeriodPayload() {
    return {
      start: periodStartInput ? normalizeDateInput(periodStartInput, true) : '',
      end: periodEndInput ? normalizeDateInput(periodEndInput, true) : ''
    };
  }

  function getDisplayRange() {
    const { start, end } = getPeriodPayload();

    if (!start) {
      return daysOfWeek.map((day, idx) => ({
        key: `placeholder-${idx}`,
        dayName: day,
        displayDate: 'Set period start'
      }));
    }

    const startDate = new Date(`${start}T00:00:00`);
    if (Number.isNaN(startDate.getTime())) {
      return daysOfWeek.map((day, idx) => ({
        key: `placeholder-${idx}`,
        dayName: day,
        displayDate: 'Invalid date'
      }));
    }

    const defaultEnd = new Date(startDate);
    defaultEnd.setDate(defaultEnd.getDate() + 6);

    let endDate = null;
    if (end) {
      const parsedEnd = new Date(`${end}T00:00:00`);
      if (!Number.isNaN(parsedEnd.getTime()) && parsedEnd >= startDate) {
        endDate = parsedEnd;
      }
    }

    if (!endDate || endDate < defaultEnd) {
      endDate = defaultEnd;
    }

    const range = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      range.push({
        key: cursor.toISOString().slice(0, 10),
        dayName: cursor.toLocaleDateString(undefined, { weekday: 'long' }),
        displayDate: formatHumanDate(cursor)
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return range;
  }

  function formatHumanDate(date) {
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function updatePeriodHintVisibility() {
    if (!periodHint) {
      return;
    }
    const { start, end } = getPeriodPayload();
    const requiresDates = !(start && end);
    periodHint.classList.toggle('hidden', !requiresDates);
  }

  function normalizeDateInput(input, silent = false) {
    if (!input) {
      return '';
    }
    const normalized = normalizeDateValue(input.value?.trim());
    if (!silent) {
      input.value = normalized;
    }
    return normalized;
  }

  function normalizeDateValue(raw) {
    if (!raw) {
      return '';
    }

    const slashPattern = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/;
    const match = raw.match(slashPattern);
    if (match) {
      let [, day, month, year] = match;
      if (year.length === 2) {
        year = `20${year}`;
      }
      return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return raw;
  }

  function persistEntries() {
    const hasEntries = Object.keys(entries).length > 0;
    const periodPayload = getPeriodPayload();
    const hasPeriod = Boolean(periodPayload.start || periodPayload.end);

    if (!hasEntries && !hasPeriod) {
      localStorage.removeItem(storageKey);
      return;
    }

    const payload = { ...entries };
    if (hasPeriod) {
      payload._period = periodPayload;
    }

    localStorage.setItem(storageKey, JSON.stringify(payload));
  }

  function handleSavePdf() {
    const defaultStub = buildDefaultFilename();
    const suggested = `${defaultStub}.pdf`;
    const userInput = window.prompt('Enter a file name for your PDF:', suggested);
    if (userInput === null) {
      return;
    }

    const trimmed = userInput.trim() || suggested;
    const sanitized = sanitizeFilename(trimmed);
    const finalName = sanitized.toLowerCase().endsWith('.pdf') ? sanitized : `${sanitized}.pdf`;
    const previousTitle = document.title;
    document.title = finalName.replace(/\.pdf$/i, '');
    window.print();
    document.title = previousTitle;
  }

  function buildDefaultFilename() {
    const { start, end } = getPeriodPayload();
    const formattedStart = formatDateForFilename(start);
    const formattedEnd = formatDateForFilename(end);
    if (formattedStart && formattedEnd) {
      return `${formattedStart} to ${formattedEnd}`;
    }
    if (formattedStart) {
      return formattedStart;
    }
    if (formattedEnd) {
      return formattedEnd;
    }
    return 'weekly-timesheet';
  }

  function formatDateForFilename(value) {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}_${month}_${year}`;
  }

  function sanitizeFilename(name) {
    return name.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, ' ').trim() || 'weekly-timesheet';
  }

  function calculateHours(start, end, breakHours = 0) {
    if (!start || !end) {
      return null;
    }

    const startDate = new Date(`1970-01-01T${start}:00`);
    const endDate = new Date(`1970-01-01T${end}:00`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return null;
    }

    let diff = (endDate - startDate) / 3600000;
    if (diff < 0) {
      diff += 24; // Handles shifts past midnight.
    }

    const adjusted = diff - breakHours;
    return adjusted > 0 ? adjusted : 0;
  }

  function safeParse(value) {
    if (!value) {
      return {};
    }

    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (err) {
      console.warn('Invalid timesheet data. Clearing storage.', err);
      localStorage.removeItem(storageKey);
      return {};
    }
  }
});
