const STORAGE_KEY = 'finance-dashboard-data';

export const storageService = {
  getData: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {
        balance: 0,
        transactions: [],
        goals: []
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return {
        balance: 0,
        transactions: [],
        goals: []
      };
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

  clearData: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
};
