import { normaliseSnapshotSections } from '../utils/snapshotConfig';

const STORAGE_KEY = 'finance-dashboard-data';
const SETTINGS_KEY = 'finance-dashboard-settings';

const DEFAULT_DATA = {
  balance: 0,
  transactions: [],
  goals: [],
  budgets: {},
  recurringTransactions: [],
  planningItems: [],
  snapshotSections: normaliseSnapshotSections(),
  netWorthSnapshots: []
};

const normaliseData = (data = {}) => ({
  ...DEFAULT_DATA,
  ...data,
  transactions: Array.isArray(data.transactions) ? data.transactions : [],
  goals: Array.isArray(data.goals) ? data.goals : [],
  budgets: data.budgets || {},
  recurringTransactions: Array.isArray(data.recurringTransactions) ? data.recurringTransactions : [],
  planningItems: Array.isArray(data.planningItems) ? data.planningItems : [],
  snapshotSections: normaliseSnapshotSections(data.snapshotSections),
  netWorthSnapshots: Array.isArray(data.netWorthSnapshots) ? data.netWorthSnapshots : []
});

export const storageService = {
  getData: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? normaliseData(JSON.parse(data)) : { ...DEFAULT_DATA };
    } catch (error) {
      console.error('Error loading data:', error);
      return { ...DEFAULT_DATA };
    }
  },

  saveData: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },

  getSettings: () => {
    try {
      const settings = localStorage.getItem(SETTINGS_KEY);
      return settings ? JSON.parse(settings) : {
        currency: 'USD',
        theme: 'dark'
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        currency: 'USD',
        theme: 'dark'
      };
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },

  clearData: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },

  exportData: () => {
    try {
      const data = storageService.getData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exporting data:', error);
      return false;
    }
  },

  importData: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let data = JSON.parse(e.target.result);
          // Validate data structure
          if (!Object.prototype.hasOwnProperty.call(data, 'balance') ||
              !Array.isArray(data.transactions) || 
              !Array.isArray(data.goals)) {
            throw new Error('Invalid data format');
          }
          // Ensure all required fields exist
          data = normaliseData(data);
          
          storageService.saveData(data);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  getStorageSize: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      console.error('Error getting storage size:', error);
      return 0;
    }
  }
};
