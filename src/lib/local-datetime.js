/**
 * Helpers for splitting a timestamp into the `<input type="date">` and
 * `<input type="time">` values an admin edits, and back again.
 *
 * The invariant that matters: whatever timezone these are read in, they must be
 * recombined in the SAME one. The session edit form used to derive the date with
 * toISOString() (UTC) but the time with toTimeString() (local), then recombine
 * them as local. Whenever local time and UTC date fell on different days — every
 * evening session in a negative-offset zone such as US Eastern — the two
 * disagreed, and each save silently pushed the session forward by a day.
 *
 * Both functions therefore work purely in the browser's local zone, which is
 * also how `new Date("YYYY-MM-DDTHH:mm:00")` is parsed on submit.
 */

/** @param {string | number | Date} value */
function toLocalDateValue(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

/** @param {string | number | Date} value */
function toLocalTimeValue(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return [
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
  ].join(':')
}

/**
 * Recombine the two input values into a Date, interpreted in local time —
 * matching how the form's `new Date(`${date}T${time}:00`)` behaves.
 * @param {string} date `YYYY-MM-DD`
 * @param {string} time `HH:mm`
 */
function fromLocalDateTimeValues(date, time) {
  if (!date || !time) return null
  const d = new Date(`${date}T${time}:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

module.exports = {
  toLocalDateValue,
  toLocalTimeValue,
  fromLocalDateTimeValues,
}
