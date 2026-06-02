
import { GoogleGenAI, Type } from "@google/genai";
import { MasterBarang } from "../types";

export const geminiService = {
  async analyzeStock(stockData: MasterBarang[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Berikut adalah data stok ATK saat ini:
      ${JSON.stringify(stockData.map(s => ({ 
        nama: s.NamaBarang, 
        stok: s.StokSaatIni, 
        min: s.MinimumStok, 
        satuan: s.Satuan 
      })))}

      Berikan ringkasan analisis dalam Bahasa Indonesia yang singkat (max 3 poin):
      1. Barang mana yang paling kritis harus segera dipesan.
      2. Saran pengelolaan stok untuk efisiensi biaya.
      3. Tren stok yang perlu diwaspadai.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Gagal mendapatkan analisis AI. Pastikan API key valid.";
    }
  }
};
