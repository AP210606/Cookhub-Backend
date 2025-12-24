const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

router.get('/', applicationController.getApplications);
router.put('/:id', applicationController.updateApplication);

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const { protect, restrictToAssignedLocations } = require('../middleware/authMiddleware');
// const Application = require('../models/Application');

// // GET applications by location
// router.get('/', protect, restrictToAssignedLocations, async (req, res) => {
//   try {
//     const { location } = req.query;
//     const applications = await Application.find({ location });
//     res.json(applications);
//   } catch (error) {
//     console.error('Error fetching applications:', error.message);
//     res.status(500).json({ message: 'Server error: Could not fetch applications' });
//   }
// });

// // UPDATE application status
// router.put('/:id', protect, restrictToAssignedLocations, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const application = await Application.findById(req.params.id);

//     if (!application) {
//       return res.status(404).json({ message: 'Application not found' });
//     }

//     if (!req.user.assignedLocations.includes(application.location)) {
//       return res.status(403).json({ message: 'Access Denied: You are not authorized to modify this application' });
//     }

//     application.status = status;
//     await application.save();

//     res.json({ message: `Application ${status}`, application });
//   } catch (error) {
//     console.error('Error updating application:', error.message);
//     res.status(500).json({ message: 'Server error: Could not update application' });
//   }
// });

// module.exports = router;
