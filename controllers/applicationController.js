const Application = require('../models/Application');

// Get all applications for a location
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ location: req.query.location });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update application status
exports.updateApplication = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedApp = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedApp) return res.status(404).json({ message: 'Application not found' });
    res.json(updatedApp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};