import { create } from "zustand";
import api from "../services/api";

const useEventStore = create((set, get) => ({
  events: [],
  upcomingEvents: [],
  loading: false,
  error: null,

  // Fetch all events for a given period
  fetchEvents: async (start, end) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/events", {
        params: { start, end },
      });
      set({ events: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching events",
        loading: false,
      });
      throw error;
    }
  },

  // Fetch upcoming 5 events
  fetchUpcomingEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/events/upcoming");
      set({ upcomingEvents: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching upcoming events",
        loading: false,
      });
      throw error;
    }
  },

  // Create a new event
  createEvent: async (eventData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/events", eventData);
      set((state) => ({
        events: [...state.events, response.data].sort((a, b) => new Date(a.date) - new Date(b.date)),
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error creating event",
        loading: false,
      });
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/events/${eventId}`);
      set((state) => ({
        events: state.events.filter((e) => e._id !== eventId),
        upcomingEvents: state.upcomingEvents.filter((e) => e._id !== eventId),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error deleting event",
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useEventStore;
