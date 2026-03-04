import api from "./apiService";

export const recordService = {
  async post(id: number, author: number, audiofile: Blob): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("audio", audiofile);

      const res = await api.post(`/api/Audio/${id}/${author}`, formData, {
        // wichtig, falls apiService global application/json setzt
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (e) {
      console.error("error", e);
      throw e;
    }
  },

  async get(id: number): Promise<Blob | null> {
    try {
      const audioRes = await api.get(`/api/audio/${id}`, {
        responseType: "blob",
      });
      return audioRes.data;
    } catch (error) {
      console.error("Error fetching customer photo:", error);
      return null;
    }
  },
};
