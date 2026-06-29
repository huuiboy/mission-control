function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getLocalDateInputValue(date = new Date()) {
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
}

export function makeTimestampFromDateInput(dateValue: string) {
  if (!dateValue) {
    return new Date().toISOString();
  }

  return new Date(`${dateValue}T12:00:00`).toISOString();
}
