// Default production memakai reverse proxy Nginx /api agar browser tidak memanggil localhost user.
const API_URL: string = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const sheetService = {
  async getData() {
    try {
      const response = await fetch(`${API_URL}?action=getData`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      return { master: [], logs: [] };
    }
  },

  async addBarang(data: any) {
    return this.postData({ action: 'addBarang', ...data });
  },

  async updateBarang(data: any) {
    return this.postData({ action: 'updateBarang', ...data });
  },

  async deleteBarang(idBarang: string | number) {
    return this.postData({ action: 'deleteBarang', idBarang });
  },

  async addLog(log: any) {
    return this.postData({ action: 'addLog', ...log });
  },

  async postData(payload: any) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      console.error("Error posting data:", error);
      return { success: false, error: "Connection Failed" };
    }
  }
};
