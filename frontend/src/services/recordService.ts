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
};
