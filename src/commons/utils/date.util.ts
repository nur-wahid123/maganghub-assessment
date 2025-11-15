export function fromStartOfThisMonthToToday(): [Date, Date] {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const today = new Date();
  today.setDate(new Date().getDate() + 1);
  return [startOfMonth, today];
}

export function toYYYYMM(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

export function convertMonthNumberToMonthName(month_number: number) {
  const months: string[] = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return months[month_number];
}

export function convertMonthNumberToShortMonthName(month_number: number) {
  const months: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  return months[month_number];
}

export function fromStartOfLastMonthToTodayOnLastMonth(): [Date, Date] {
  const startOfMonth = new Date();
  const today = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setMonth(today.getMonth() - 1);
  today.setDate(1);
  today.setDate(0);
  return [startOfMonth, today];
}

export function formatDateToDateMonthString(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

export function weeksQuery() {
  const startOfThisWeek = new Date();
  const endOfThisWeek = new Date();
  const startOfLastWeek = new Date();
  startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay());
  startOfLastWeek.setDate(
    startOfLastWeek.getDate() - startOfLastWeek.getDay() - 7,
  );
  endOfThisWeek.setDate(endOfThisWeek.getDate() - endOfThisWeek.getDay() + 7);
  return {
    startOfThisWeek,
    endOfThisWeek,
    startOfLastWeek,
    endOfLastWeek: startOfThisWeek,
  };
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
