const toNumber = (value) => Number(value || 0);

export const SNAPSHOT_ENTRY_TYPES = [
  { value: 'available_cash', label: 'Available cash' },
  { value: 'liability', label: 'Credit card / debt' },
  { value: 'savings', label: 'Savings' },
  { value: 'restricted_savings', label: 'Restricted savings' },
  { value: 'investment', label: 'Investment' },
  { value: 'pension', label: 'Pension / long-term asset' },
  { value: 'monthly_outgoing', label: 'Monthly outgoing' },
  { value: 'income_context', label: 'Income / context only' },
];

export const DEFAULT_SNAPSHOT_SECTIONS = [
  {
    id: 'bank-accounts',
    title: 'Bank accounts',
    help: 'Money in and available cash accounts.',
    entries: [
      { id: 'santander', name: 'Santander', type: 'available_cash', legacyKey: 'santander' },
    ],
  },
  {
    id: 'credit-cards',
    title: 'Credit cards',
    help: 'Money out and owed balances. These reduce your cash position.',
    entries: [
      { id: 'tesco', name: 'Tesco', type: 'liability', legacyKey: 'tesco' },
      { id: 'amexCashback', name: 'Amex - Cashback', type: 'liability', legacyKey: 'amexCashback' },
    ],
  },
  {
    id: 'savings-investments',
    title: 'Savings and investments',
    help: 'Savings, investments, and restricted savings accounts.',
    entries: [
      { id: 'moneyboxStocksSharesIsa', name: 'MoneyBox - S&S ISA', type: 'investment', legacyKey: 'moneyboxStocksSharesIsa' },
      { id: 'moneyboxLifetimeIsa', name: 'MoneyBox - Lifetime ISA', type: 'restricted_savings', legacyKey: 'moneyboxLifetimeIsa' },
      { id: 'moneyboxSimpleSaver', name: 'MoneyBox - Simple Saver', type: 'savings', legacyKey: 'moneyboxSimpleSaver' },
      { id: 'moneyboxCashIsa', name: 'MoneyBox - Cash ISA', type: 'savings', legacyKey: 'moneyboxCashIsa' },
    ],
  },
  {
    id: 'monthly-commitments',
    title: 'Monthly contributions',
    help: 'Snapshot-level monthly outgoings or savings commitments.',
    entries: [
      { id: 'moneyboxMonthly', name: 'MoneyBox Monthly', type: 'monthly_outgoing', legacyKey: 'moneyboxMonthly' },
    ],
  },
  {
    id: 'income-long-term',
    title: 'Income and long-term value',
    help: 'Income context and long-term value that should not be treated as available cash.',
    entries: [
      { id: 'paycheck', name: 'Paycheck', type: 'income_context', legacyKey: 'paycheck' },
      { id: 'pension', name: 'Pension', type: 'pension', legacyKey: 'pension' },
    ],
  },
];

export const LEGACY_SNAPSHOT_KEYS = {
  santander: 'santander',
  tesco: 'tesco',
  amexCashback: 'amex_cashback',
  moneybox: 'moneybox',
  moneyboxStocksSharesIsa: 'moneybox_stocks_shares_isa',
  moneyboxLifetimeIsa: 'moneybox_lifetime_isa',
  moneyboxSimpleSaver: 'moneybox_simple_saver',
  moneyboxCashIsa: 'moneybox_cash_isa',
  moneyboxMonthly: 'moneybox_monthly',
  paycheck: 'paycheck',
  pension: 'pension',
};

const cloneSections = (sections) => sections.map((section) => ({
  ...section,
  entries: (section.entries || []).map((entry) => ({ ...entry })),
}));

const sanitizeEntry = (entry, index) => ({
  id: String(entry.id || `entry-${Date.now()}-${index}`),
  name: String(entry.name || 'Untitled account'),
  type: SNAPSHOT_ENTRY_TYPES.some((type) => type.value === entry.type) ? entry.type : 'available_cash',
  legacyKey: entry.legacyKey,
});

export function normaliseSnapshotSections(sections) {
  if (!Array.isArray(sections)) {
    return cloneSections(DEFAULT_SNAPSHOT_SECTIONS);
  }

  return sections.map((section, sectionIndex) => ({
    id: String(section.id || `section-${Date.now()}-${sectionIndex}`),
    title: String(section.title || 'Untitled section'),
    help: String(section.help || ''),
    entries: Array.isArray(section.entries) ? section.entries.map(sanitizeEntry) : [],
  }));
}

export function getSnapshotEntries(snapshot = {}, sections = DEFAULT_SNAPSHOT_SECTIONS) {
  if (Array.isArray(snapshot.entries) && snapshot.entries.length > 0) {
    return snapshot.entries.map((entry) => ({
      id: entry.id || entry.entryId,
      entryId: entry.entryId || entry.id,
      sectionId: entry.sectionId,
      name: entry.name || 'Untitled account',
      type: entry.type || 'available_cash',
      value: toNumber(entry.value),
    }));
  }

  return normaliseSnapshotSections(sections).flatMap((section) => (
    section.entries.map((entry) => ({
      id: entry.id,
      entryId: entry.id,
      sectionId: section.id,
      name: entry.name,
      type: entry.type,
      value: toNumber(snapshot[entry.legacyKey || entry.id]),
    }))
  ));
}

export function createEmptySnapshot(sections = DEFAULT_SNAPSHOT_SECTIONS, date) {
  const snapshot = {
    date,
    notes: '',
    entries: [],
  };

  normaliseSnapshotSections(sections).forEach((section) => {
    section.entries.forEach((entry) => {
      snapshot.entries.push({
        entryId: entry.id,
        sectionId: section.id,
        name: entry.name,
        type: entry.type,
        value: '',
      });
      if (entry.legacyKey) snapshot[entry.legacyKey] = '';
    });
  });

  return snapshot;
}

export function applyLegacySnapshotFields(snapshot = {}, sections = DEFAULT_SNAPSHOT_SECTIONS) {
  const nextSnapshot = { ...snapshot };
  const entries = getSnapshotEntries(snapshot, sections);

  entries.forEach((entry) => {
    const section = normaliseSnapshotSections(sections).find((candidate) => candidate.id === entry.sectionId);
    const templateEntry = section?.entries.find((candidate) => candidate.id === entry.entryId);
    if (templateEntry?.legacyKey) {
      nextSnapshot[templateEntry.legacyKey] = toNumber(entry.value);
    }
  });

  const legacyValues = Object.keys(LEGACY_SNAPSHOT_KEYS).reduce((result, key) => {
    result[key] = toNumber(nextSnapshot[key]);
    return result;
  }, {});

  const moneyboxBreakdown = ['moneyboxStocksSharesIsa', 'moneyboxLifetimeIsa', 'moneyboxSimpleSaver', 'moneyboxCashIsa']
    .reduce((sum, key) => sum + toNumber(legacyValues[key]), 0);

  return {
    ...nextSnapshot,
    ...legacyValues,
    moneybox: moneyboxBreakdown || toNumber(nextSnapshot.moneybox),
    entries: entries.map((entry) => ({
      entryId: entry.entryId || entry.id,
      sectionId: entry.sectionId,
      name: entry.name,
      type: entry.type,
      value: toNumber(entry.value),
    })),
  };
}

export function buildSnapshotEntriesFromForm(snapshot = {}, sections = DEFAULT_SNAPSHOT_SECTIONS) {
  const formEntries = Array.isArray(snapshot.entries) ? snapshot.entries : [];
  return normaliseSnapshotSections(sections).flatMap((section) => (
    section.entries.map((entry) => {
      const matchingEntry = formEntries.find((candidate) => candidate.entryId === entry.id || candidate.id === entry.id);
      return {
        entryId: entry.id,
        sectionId: section.id,
        name: entry.name,
        type: entry.type,
        value: toNumber(matchingEntry?.value ?? snapshot[entry.legacyKey || entry.id]),
      };
    })
  ));
}

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
