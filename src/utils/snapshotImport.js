const normaliseHeader = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const compactHeader = (value = '') => normaliseHeader(value).replace(/\s+/g, '');

const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

const monthNames = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const formatDateParts = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return '';
  }

  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
};

const normaliseYear = (rawYear) => {
  const year = Number(rawYear);
  if (!Number.isInteger(year)) return null;
  if (String(rawYear).length === 2) return 2000 + year;
  return year;
};

const parseImportDate = (value = '') => {
  const input = String(value).trim();
  if (!input) return '';

  const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return formatDateParts(Number(year), Number(month), Number(day));
  }

  const slashMatch = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const [, day, month, rawYear] = slashMatch;
    const year = normaliseYear(rawYear);
    return year ? formatDateParts(year, Number(month), Number(day)) : '';
  }

  const dayMonthYearMatch = input.match(/^(\d{1,2})[\s-]+([A-Za-z]+)[\s,-]+(\d{2,4})$/);
  if (dayMonthYearMatch) {
    const [, day, rawMonth, rawYear] = dayMonthYearMatch;
    const month = monthNames[rawMonth.toLowerCase()];
    const year = normaliseYear(rawYear);
    return month && year ? formatDateParts(year, month, Number(day)) : '';
  }

  const monthDayYearMatch = input.match(/^([A-Za-z]+)[\s-]+(\d{1,2}),?[\s-]+(\d{2,4})$/);
  if (monthDayYearMatch) {
    const [, rawMonth, day, rawYear] = monthDayYearMatch;
    const month = monthNames[rawMonth.toLowerCase()];
    const year = normaliseYear(rawYear);
    return month && year ? formatDateParts(year, month, Number(day)) : '';
  }

  return '';
};

const parseMoney = (value = '') => {
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return 0;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
};

const getEntryHeaders = (sections = []) => {
  const map = new Map();

  sections.forEach((section) => {
    section.entries.forEach((entry) => {
      map.set(compactHeader(entry.name), {
        entryId: entry.id,
        sectionId: section.id,
        name: entry.name,
        type: entry.type,
      });
    });
  });

  return map;
};

const legacyFieldAliases = {
  santander: ['santander'],
  tesco: ['tesco'],
  amexCashback: ['amexcashback', 'amexcashbackcard', 'amex'],
  moneybox: ['moneybox'],
  moneyboxStocksSharesIsa: ['moneyboxstocksandsharesisa', 'moneyboxsandsisa', 'moneyboxssisa', 'stocksandsharesisa'],
  moneyboxLifetimeIsa: ['moneyboxlifetimeisa', 'lifetimeisa', 'lisa'],
  moneyboxSimpleSaver: ['moneyboxsimplesaver', 'simplesaver'],
  moneyboxCashIsa: ['moneyboxcashisa', 'cashisa'],
  moneyboxMonthly: ['moneyboxmonthly', 'monthlyoutgoing', 'monthlyoutgoings'],
  paycheck: ['paycheck', 'salary', 'income'],
  pension: ['pension'],
  notes: ['notes', 'note'],
};

const getLegacyField = (header) => Object.entries(legacyFieldAliases)
  .find(([, aliases]) => aliases.includes(header))?.[0];

export function parseSnapshotCSV(csvText, sections = []) {
  const lines = String(csvText)
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('CSV needs a header row and at least one snapshot row.');
  }

  const headers = parseCSVLine(lines[0]);
  const normalisedHeaders = headers.map(compactHeader);
  const dateIndex = normalisedHeaders.findIndex((header) => header === 'date' || header === 'snapshotdate');

  if (dateIndex === -1) {
    throw new Error('CSV must include a Date column.');
  }

  const entryHeaders = getEntryHeaders(sections);
  const snapshots = [];
  const errors = [];

  lines.slice(1).forEach((line, rowIndex) => {
    const rowNumber = rowIndex + 2;
    const values = parseCSVLine(line);
    const date = parseImportDate(values[dateIndex]);

    if (!date) {
      errors.push(`Row ${rowNumber}: invalid or missing date.`);
      return;
    }

    const snapshot = {
      id: `import-${date}-${rowNumber}`,
      date,
      notes: '',
      entries: [],
      createdAt: new Date().toISOString(),
    };

    headers.forEach((header, index) => {
      if (index === dateIndex) return;

      const compact = normalisedHeaders[index];
      const value = values[index] || '';
      const legacyField = getLegacyField(compact);
      const entry = entryHeaders.get(compact);

      if (legacyField === 'notes') {
        snapshot.notes = value;
      } else if (legacyField) {
        snapshot[legacyField] = parseMoney(value);
      }

      if (entry) {
        snapshot.entries.push({
          ...entry,
          value: parseMoney(value),
        });
      }
    });

    snapshots.push(snapshot);
  });

  if (snapshots.length === 0 && errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return { snapshots, errors };
}
