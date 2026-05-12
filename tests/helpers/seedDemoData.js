import { demoData, demoSettings } from '../fixtures/demoData.js';

export async function seedDemoData(page) {
  await page.addInitScript(({ data, settings }) => {
    window.localStorage.setItem('finance-dashboard-data', JSON.stringify(data));
    window.localStorage.setItem('finance-dashboard-settings', JSON.stringify(settings));
    window.localStorage.setItem('financial-tracker-theme', settings.theme);
  }, { data: demoData, settings: demoSettings });
}
