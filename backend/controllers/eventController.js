import Event from '../models/Event.js';

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, type, location } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({ message: "Title and Date are required" });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      type,
      location,
      createdBy: req.user.id
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const { start, end } = req.query;
    let query = {};
    
    if (start && end) {
      query.date = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const events = await Event.find(query).sort({ date: 1 }).populate('createdBy', 'name');
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get recent and upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({ date: { $gte: now } })
      .sort({ date: 1 })
      .limit(5);
      
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Only allow creator or admin to delete
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: "User not authorized" });
    }

    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
