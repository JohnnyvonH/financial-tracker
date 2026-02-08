/**
 * Parse CSV file and convert to transaction objects
 */

export function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }

  // Parse header
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Find column indices
  const dateIndex = header.findIndex(h => h.includes('date'));
  const descIndex = header.findIndex(h => h.includes('desc') || h.includes('name') || h.includes('transaction'));
  const amountIndex = header.findIndex(h => h.includes('amount') || h.includes('value'));
  const categoryIndex = header.findIndex(h => h.includes('category') || h.includes('type'));

  if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
    throw new Error('CSV must have Date, Description, and Amount columns');
  }

  const transactions = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length < 3) continue;

    const dateStr = values[dateIndex]?.trim();
    const description = values[descIndex]?.trim();
    const amountStr = values[amountIndex]?.trim();
    const category = categoryIndex !== -1 ? values[categoryIndex]?.trim() : 'Other';

    if (!dateStr || !description || !amountStr) continue;

    // Parse date
    let date;
    if (dateStr.includes('/')) {
      // MM/DD/YYYY format
      const [month, day, year] = dateStr.split('/');
      date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else if (dateStr.includes('-')) {
      // YYYY-MM-DD format
      date = dateStr;
    } else {
      continue; // Skip invalid date format
    }

    // Parse amount
    const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, ''));
    if (isNaN(amount) || amount === 0) continue;

    // Determine type (negative = expense, positive = income)
    const type = amount < 0 ? 'expense' : 'income';

    transactions.push({
      id: Date.now() + i,
      date,
      description,
      amount: Math.abs(amount),
      category: category || 'Other',
      type
    });
  }

  return transactions;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}
