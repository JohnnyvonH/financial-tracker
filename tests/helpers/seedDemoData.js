import { demoData, demoSettings } from '../fixtures/demoData.js';

export async function seedDemoData(page, overrides = {}) {
  const seededData = { ...demoData, ...overrides };

  await page.addInitScript(({ data, settings }) => {
    window.localStorage.setItem('finance-dashboard-data', JSON.stringify(data));
    window.localStorage.setItem('finance-dashboard-settings', JSON.stringify(settings));
    window.localStorage.setItem('financial-tracker-theme', settings.theme);
  }, { data: seededData, settings: demoSettings });
}
