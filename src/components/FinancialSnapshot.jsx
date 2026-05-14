import React, { useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Info, Plus, SlidersHorizontal, Trash2, Upload } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getSnapshotTotals } from '../utils/financeSummary';
import { parseSnapshotCSV } from '../utils/snapshotImport';
import {
  SNAPSHOT_ENTRY_TYPES,
  applyLegacySnapshotFields,
  buildSnapshotEntriesFromForm,
  createEmptySnapshot,
  createId,
  getSnapshotEntries,
  normaliseSnapshotSections,
} from '../utils/snapshotConfig';

const today = new Date().toISOString().split('T')[0];

const numberValue = (value) => Number(value || 0);

const typeLabel = (value) => SNAPSHOT_ENTRY_TYPES.find((type) => type.value === value)?.label || 'Available cash';

function SnapshotMetric({ label, value, detail }) {
  return (
    <div className="snapshot-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <p>{detail}</p>}
    </div>
  );
}

function DifferenceBadge({ label, difference, currency }) {
  const absDifference = Math.abs(difference);
  const isMatched = absDifference < 0.01;

  return (
    <div className={`snapshot-difference ${isMatched ? 'snapshot-difference-ok' : 'snapshot-difference-review'}`}>
      {isMatched ? <CheckCircle2 size={16} /> : <Info size={16} />}
      <span>{label}</span>
      <strong>{isMatched ? 'Matched' : formatCurrency(difference, currency)}</strong>
    </div>
  );
}

function moveItem(items, index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(nextIndex, 0, item);
  return nextItems;
}

export default function FinancialSnapshot({
  netWorthSnapshots,
  snapshotSections,
  onUpdateSnapshotSections,
  onAddNetWorthSnapshot,
  onImportNetWorthSnapshots,
  onDeleteNetWorthSnapshot,
  currency,
}) {
  const sections = useMemo(() => normaliseSnapshotSections(snapshotSections), [snapshotSections]);
  const [snapshotForm, setSnapshotForm] = useState(() => createEmptySnapshot(sections, today));
  const [isManagingTemplate, setIsManagingTemplate] = useState(false);
  const [sectionDrafts, setSectionDrafts] = useState(sections);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef(null);

  const latestSnapshot = netWorthSnapshots[0];
  const latestTotals = getSnapshotTotals(latestSnapshot);
  const snapshotToPreview = useMemo(() => ({
    ...snapshotForm,
    entries: buildSnapshotEntriesFromForm(snapshotForm, sections),
  }), [snapshotForm, sections]);
  const draftTotals = useMemo(() => getSnapshotTotals(snapshotToPreview), [snapshotToPreview]);

  const resetFormForSections = (nextSections) => {
    setSnapshotForm(createEmptySnapshot(nextSections, snapshotForm.date || today));
  };

  const updateSnapshotForm = (key, value) => {
    setSnapshotForm((current) => ({ ...current, [key]: value }));
  };

  const updateEntryValue = (entryId, value) => {
    setSnapshotForm((current) => ({
      ...current,
      entries: current.entries.map((entry) => (
        entry.entryId === entryId ? { ...entry, value } : entry
      )),
    }));
  };

  const handleSnapshotSubmit = (event) => {
    event.preventDefault();
    const snapshot = applyLegacySnapshotFields({
      ...snapshotForm,
      date: snapshotForm.date || today,
      entries: buildSnapshotEntriesFromForm(snapshotForm, sections),
    }, sections);

    onAddNetWorthSnapshot(snapshot);
    setSnapshotForm(createEmptySnapshot(sections, today));
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = parseSnapshotCSV(reader.result, sections);
        const existingDates = new Set(netWorthSnapshots.map((snapshot) => snapshot.date));
        const duplicateCount = result.snapshots.filter((snapshot) => existingDates.has(snapshot.date)).length;

        setImportPreview({
          fileName: file.name,
          snapshots: result.snapshots,
          duplicateCount,
        });
        setImportErrors(result.errors);
      } catch (error) {
        setImportPreview(null);
        setImportErrors([error.message]);
      } finally {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      setImportPreview(null);
      setImportErrors(['Could not read the selected file.']);
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const importSnapshots = async () => {
    if (!importPreview?.snapshots.length) return;

    setIsImporting(true);
    const imported = await onImportNetWorthSnapshots(importPreview.snapshots);
    setIsImporting(false);

    if (imported) {
      setImportPreview(null);
      setImportErrors([]);
    }
  };

  const openTemplateManager = () => {
    setSectionDrafts(sections);
    setIsManagingTemplate(true);
  };

  const saveTemplate = async () => {
    const nextSections = normaliseSnapshotSections(sectionDrafts);
    setIsSavingTemplate(true);
    const saved = await onUpdateSnapshotSections(nextSections);
    setIsSavingTemplate(false);

    if (!saved) {
      return;
    }

    resetFormForSections(nextSections);
    setIsManagingTemplate(false);
  };

  const updateSection = (sectionId, updates) => {
    setSectionDrafts((current) => current.map((section) => (
      section.id === sectionId ? { ...section, ...updates } : section
    )));
  };

  const updateTemplateEntry = (sectionId, entryId, updates) => {
    setSectionDrafts((current) => current.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        entries: section.entries.map((entry) => (
          entry.id === entryId ? { ...entry, ...updates } : entry
        )),
      };
    }));
  };

  const addSection = () => {
    setSectionDrafts((current) => ([
      ...current,
      {
        id: createId('section'),
        title: 'New section',
        help: 'Describe what this group tracks.',
        entries: [],
      },
    ]));
  };

  const addEntry = (sectionId) => {
    setSectionDrafts((current) => current.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        entries: [
          ...section.entries,
          { id: createId('entry'), name: 'New account', type: 'available_cash' },
        ],
      };
    }));
  };

  const deleteSection = (sectionId) => {
    setSectionDrafts((current) => current.filter((section) => section.id !== sectionId));
  };

  const deleteEntry = (sectionId, entryId) => {
    setSectionDrafts((current) => current.map((section) => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        entries: section.entries.filter((entry) => entry.id !== entryId),
      };
    }));
  };

  const moveSection = (index, direction) => {
    setSectionDrafts((current) => moveItem(current, index, direction));
  };

  const moveEntry = (sectionId, index, direction) => {
    setSectionDrafts((current) => current.map((section) => {
      if (section.id !== sectionId) return section;
      return { ...section, entries: moveItem(section.entries, index, direction) };
    }));
  };

  return (
    <div className="financial-snapshot">
      <section className="finance-hero snapshot-hero">
        <div>
          <p className="eyebrow">Current Finances</p>
          <h1>Track your current finances at a point in time</h1>
          <p>
            Record banks, cards, savings, investments, pensions, income context, and monthly commitments using a template you can edit.
          </p>
        </div>
        <div className="finance-hero-grid">
          <SnapshotMetric
            label="Max available cash"
            value={formatCurrency(latestTotals.maxAvailableCash, currency)}
            detail={latestSnapshot?.date || 'No snapshot yet'}
          />
          <SnapshotMetric
            label="Available assets"
            value={formatCurrency(latestTotals.availableAssets, currency)}
          />
          <SnapshotMetric
            label="All wealth"
            value={formatCurrency(latestTotals.allAssets, currency)}
          />
        </div>
      </section>

      <div className="snapshot-layout">
        <section className="card snapshot-entry-card">
          <div className="section-header">
            <div>
              <h2 className="section-title">Add Current Finances</h2>
              <p className="section-subtitle">One entry equals one dated snapshot of your finances.</p>
            </div>
            <button className="btn btn-secondary" type="button" onClick={openTemplateManager}>
              <SlidersHorizontal size={16} />Edit template
            </button>
          </div>

          {isManagingTemplate && (
            <div className="snapshot-template-manager">
              <div className="section-header">
                <div>
                  <h3>Template sections</h3>
                  <p>Use the starter setup, or replace it with your own accounts and categories.</p>
                </div>
                <button className="btn btn-secondary" type="button" onClick={addSection}>
                  <Plus size={16} />Add section
                </button>
              </div>

              {sectionDrafts.map((section, sectionIndex) => (
                <div className="snapshot-template-section" key={section.id}>
                  <div className="snapshot-template-section-header">
                    <div className="form-group">
                      <label htmlFor={`section-title-${section.id}`}>Section name</label>
                      <input
                        id={`section-title-${section.id}`}
                        value={section.title}
                        onChange={(event) => updateSection(section.id, { title: event.target.value })}
                      />
                    </div>
                    <div className="snapshot-template-actions">
                      <button className="btn-icon" type="button" onClick={() => moveSection(sectionIndex, -1)} aria-label={`Move ${section.title} up`}>
                        <ChevronUp size={16} />
                      </button>
                      <button className="btn-icon" type="button" onClick={() => moveSection(sectionIndex, 1)} aria-label={`Move ${section.title} down`}>
                        <ChevronDown size={16} />
                      </button>
                      <button className="btn-icon" type="button" onClick={() => deleteSection(section.id)} aria-label={`Delete ${section.title}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor={`section-help-${section.id}`}>Section help text</label>
                    <input
                      id={`section-help-${section.id}`}
                      value={section.help}
                      onChange={(event) => updateSection(section.id, { help: event.target.value })}
                    />
                  </div>

                  <div className="snapshot-template-entry-list">
                    {section.entries.map((entry, entryIndex) => (
                      <div className="snapshot-template-entry" key={entry.id}>
                        <div className="form-group">
                          <label htmlFor={`entry-name-${entry.id}`}>Entry name</label>
                          <input
                            id={`entry-name-${entry.id}`}
                            value={entry.name}
                            onChange={(event) => updateTemplateEntry(section.id, entry.id, { name: event.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`entry-type-${entry.id}`}>Calculation type</label>
                          <select
                            id={`entry-type-${entry.id}`}
                            value={entry.type}
                            onChange={(event) => updateTemplateEntry(section.id, entry.id, { type: event.target.value })}
                          >
                            {SNAPSHOT_ENTRY_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="snapshot-template-actions snapshot-template-entry-actions">
                          <button className="btn-icon" type="button" onClick={() => moveEntry(section.id, entryIndex, -1)} aria-label={`Move ${entry.name} up`}>
                            <ChevronUp size={16} />
                          </button>
                          <button className="btn-icon" type="button" onClick={() => moveEntry(section.id, entryIndex, 1)} aria-label={`Move ${entry.name} down`}>
                            <ChevronDown size={16} />
                          </button>
                          <button className="btn-icon" type="button" onClick={() => deleteEntry(section.id, entry.id)} aria-label={`Delete ${entry.name}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-secondary" type="button" onClick={() => addEntry(section.id)}>
                    <Plus size={16} />Add entry
                  </button>
                </div>
              ))}

              <div className="snapshot-template-footer">
                <button className="btn btn-secondary" type="button" onClick={() => setIsManagingTemplate(false)}>Cancel</button>
                <button className="btn btn-primary" type="button" onClick={saveTemplate} disabled={isSavingTemplate}>
                  {isSavingTemplate ? 'Saving...' : 'Save template'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSnapshotSubmit} className="snapshot-form">
            <div className="form-group snapshot-date-field">
              <label htmlFor="snapshot-date">Date</label>
              <input id="snapshot-date" type="date" value={snapshotForm.date} onChange={(event) => updateSnapshotForm('date', event.target.value)} />
            </div>

            {sections.map((section) => (
              <fieldset className="snapshot-fieldset" key={section.id}>
                <legend>{section.title}</legend>
                {section.help && <p>{section.help}</p>}
                <div className="snapshot-grid">
                  {section.entries.map((entry) => {
                    const formEntry = snapshotForm.entries.find((candidate) => candidate.entryId === entry.id);
                    return (
                      <div className="form-group" key={entry.id}>
                        <label htmlFor={`snapshot-${entry.id}`}>
                          {entry.name}
                          <span>{typeLabel(entry.type)}</span>
                        </label>
                        <input
                          id={`snapshot-${entry.id}`}
                          type="number"
                          step="0.01"
                          value={formEntry?.value ?? ''}
                          onChange={(event) => updateEntryValue(entry.id, event.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
                {section.entries.length === 0 && <p className="empty-table">No entries in this section yet.</p>}
              </fieldset>
            ))}

            <div className="form-group">
              <label htmlFor="snapshot-notes">Notes</label>
              <textarea id="snapshot-notes" value={snapshotForm.notes} onChange={(event) => updateSnapshotForm('notes', event.target.value)} rows="3" placeholder="Add context for this snapshot" />
            </div>

            <button className="btn btn-primary" type="submit"><Plus size={16} />Save financial snapshot</button>
          </form>
        </section>

        <aside className="snapshot-rules">
          <section className="panel snapshot-import-panel">
            <h2>Import snapshots</h2>
            <p>Upload a CSV with a Date column and account columns matching your template or starter workbook headers.</p>
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImportFile}
            />
            <button className="btn btn-secondary" type="button" onClick={() => importInputRef.current?.click()}>
              <Upload size={16} />Import CSV
            </button>

            {importPreview && (
              <div className="snapshot-import-preview">
                <strong>{importPreview.snapshots.length} row{importPreview.snapshots.length === 1 ? '' : 's'} ready</strong>
                <span>{importPreview.fileName}</span>
                {importPreview.duplicateCount > 0 && (
                  <p>{importPreview.duplicateCount} existing date{importPreview.duplicateCount === 1 ? '' : 's'} will be replaced.</p>
                )}
                <div className="snapshot-import-dates">
                  {importPreview.snapshots.slice(0, 4).map((snapshot) => (
                    <span key={snapshot.id}>{snapshot.date}</span>
                  ))}
                </div>
                <div className="planning-form-actions">
                  <button className="btn btn-primary" type="button" onClick={importSnapshots} disabled={isImporting}>
                    {isImporting ? 'Importing...' : 'Save imported snapshots'}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => setImportPreview(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {importErrors.length > 0 && (
              <div className="snapshot-import-errors">
                {importErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Calculation rules</h2>
            <ul className="rule-list">
              <li><strong>Max available cash</strong><span>Available cash minus liabilities and monthly outgoings.</span></li>
              <li><strong>Savings and investments</strong><span>Savings, investments, and restricted savings are grouped for asset totals.</span></li>
              <li><strong>Available assets</strong><span>Max available cash plus savings and investments that are not restricted.</span></li>
              <li><strong>House deposit access</strong><span>Available assets plus restricted savings.</span></li>
              <li><strong>All wealth</strong><span>Cash after liabilities plus savings, investments, restricted savings, and pension values.</span></li>
            </ul>
          </section>

          <section className="panel">
            <h2>Draft totals</h2>
            <div className="snapshot-metric-stack">
              <SnapshotMetric label="Liabilities owed" value={formatCurrency(draftTotals.cardLiabilities, currency)} />
              <SnapshotMetric label="Max available cash" value={formatCurrency(draftTotals.maxAvailableCash, currency)} />
              <SnapshotMetric label="Savings and investments" value={formatCurrency(draftTotals.moneyboxTotal, currency)} />
              <SnapshotMetric label="Available assets" value={formatCurrency(draftTotals.availableAssets, currency)} />
              <SnapshotMetric label="House deposit access" value={formatCurrency(draftTotals.houseDepositAccessibleAssets, currency)} />
              <SnapshotMetric label="All wealth" value={formatCurrency(draftTotals.allAssets, currency)} />
            </div>
            <div className="snapshot-difference-stack">
              <DifferenceBadge label="Starter template check" difference={draftTotals.moneyboxVariance} currency={currency} />
            </div>
          </section>
        </aside>
      </div>

      <section className="card">
        <h2 className="section-title">Current Finances History</h2>
        <div className="snapshot-table-wrap">
          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Entries</th>
                <th>Max Cash</th>
                <th>Available Assets</th>
                <th>House Deposit Access</th>
                <th>All Wealth</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {netWorthSnapshots.map((snapshot) => {
                const totals = getSnapshotTotals(snapshot);
                const entries = getSnapshotEntries(snapshot, sections).filter((entry) => numberValue(entry.value) !== 0);
                return (
                  <tr key={snapshot.id}>
                    <td>{snapshot.date}</td>
                    <td>
                      <div className="snapshot-history-entries">
                        {entries.map((entry) => (
                          <span key={`${snapshot.id}-${entry.entryId || entry.id}`}>
                            <strong>{entry.name}</strong>
                            {formatCurrency(numberValue(entry.value), currency)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{formatCurrency(totals.maxAvailableCash, currency)}</td>
                    <td>{formatCurrency(totals.availableAssets, currency)}</td>
                    <td>{formatCurrency(totals.houseDepositAccessibleAssets, currency)}</td>
                    <td>{formatCurrency(totals.allAssets, currency)}</td>
                    <td>{snapshot.notes}</td>
                    <td>
                      <button className="btn-icon" onClick={() => onDeleteNetWorthSnapshot(snapshot.id)} aria-label={`Delete snapshot ${snapshot.date}`}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {netWorthSnapshots.length === 0 && <p className="empty-table">No current finances snapshots yet.</p>}
        </div>
      </section>
    </div>
  );
}
