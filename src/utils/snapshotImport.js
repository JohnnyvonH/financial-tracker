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

const parseImportDate = (value = '') => {
  const input = String(value).trim();
  if (!input) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  const slashMatch = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const [, day, month, rawYear] = slashMatch;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().split('T')[0];
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
