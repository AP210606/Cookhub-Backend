// Updated: cookhub-backend/controllers/cookController.js
// Already has loginCook, but ensure it uses real bcrypt and jwt (remove placeholders)
// Install: npm install bcryptjs jsonwebtoken
// Update the placeholders with real imports

const Cook = require('../models/Cook');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all cooks for a location
exports.getCooks = async (req, res) => {
  try {
    const cooks = await Cook.find({ location: req.query.location });
    res.json(cooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new cook (Admin/Coordinator) - NOW REQUIRES PASSWORD AND HASHING
exports.addCook = async (req, res) => {
  try {
  const { name, email, phone, specialties, serviceAreas, location, password } = req.body;

  // Normalize inputs
  const normalizedEmail = email ? String(email).trim().toLowerCase() : '';

  if (!name || !normalizedEmail || !phone || !password) {
    return res.status(400).json({ message: 'Name, email, phone, and password are required' });
  }

  // Check if cook already exists by email
  const cookExists = await Cook.findOne({ email: normalizedEmail });
    if (cookExists) {
        return res.status(400).json({ message: 'Cook with this email already exists' });
    }

    // 1. Hash the password
  const hashedPassword = await bcrypt.hash(String(password).trim(), 10); // 10 is the salt rounds

    // Create a new cook object with the hashed password and explicitly set role
  const newCook = new Cook({
    name,
    email: normalizedEmail,
    phone,
    specialties,
    serviceAreas,
    location,
    password: hashedPassword, // Store the hashed password
    role: 'cook' // Assign the 'cook' role for login logic
  });

    await newCook.save();
    
    // Strip the password before sending the response
    const { password: _, ...cookDetails } = newCook.toObject();

    res.status(201).json(cookDetails);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a cook
exports.updateCook = async (req, res) => {
  try {
    // If the body contains a password, hash it before updating
    if (req.body.password) {
      req.body.password = await bcrypt.hash(String(req.body.password).trim(), 10);
    }

    // Normalize email if provided
    if (req.body.email) {
      req.body.email = String(req.body.email).trim().toLowerCase();
    }

    const updatedCook = await Cook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCook) return res.status(404).json({ message: 'Cook not found' });
    
    // Remove password before sending
    const { password: _, ...cookDetails } = updatedCook.toObject();

    res.json(cookDetails);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a cook
exports.deleteCook = async (req, res) => {
  try {
    const deletedCook = await Cook.findByIdAndDelete(req.params.id);
    if (!deletedCook) return res.status(404).json({ message: 'Cook not found' });
    res.json({ message: 'Cook deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Cook Login Functionality
 * Authenticates a cook using email and password.
 */
exports.loginCook = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Look up user only in the Cook collection
        const cook = await Cook.findOne({ email });

        if (!cook) {
            // Failure if email is not found in the Cook collection
            return res.status(401).json({ 
                message: 'Login failed. This email is not registered as a Cook or Coordinator.' 
            });
        }

        // Email found, now validate the password
        const isMatch = await bcrypt.compare(password, cook.password);

        if (!isMatch) {
            // Specific error message for password failure
            return res.status(401).json({ 
                message: 'please enter correct password' 
            });
        }

        // Success: Generate token and return Cook/Coordinator data
        const token = generateToken(cook._id, cook.role);

        const userDetails = {
            _id: cook._id,
            name: cook.name,
            email: cook.email,
            role: cook.role,
            // Include other cook-specific data here
            serviceAreas: cook.serviceAreas
        };

        res.json({
            message: `${cook.role} login successful!`,
            token,
            user: userDetails
        });

    } catch (error) {
        console.error('Cook Login Error:', error.message);
        res.status(500).json({ message: 'Server error during cook login.' });
    }
};
























//  old code below - IGNORE
// const Cook = require('../models/Cook');

// // Get all cooks for a location
// exports.getCooks = async (req, res) => {
//   try {
//     const cooks = await Cook.find({ location: req.query.location });
//     res.json(cooks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Add a new cook
// exports.addCook = async (req, res) => {
//   try {
//     const newCook = new Cook(req.body);
//     await newCook.save();
//     res.status(201).json(newCook);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // Update a cook
// exports.updateCook = async (req, res) => {
//   try {
//     const updatedCook = await Cook.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedCook) return res.status(404).json({ message: 'Cook not found' });
//     res.json(updatedCook);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // Delete a cook
// exports.deleteCook = async (req, res) => {
//   try {
//     const deletedCook = await Cook.findByIdAndDelete(req.params.id);
//     if (!deletedCook) return res.status(404).json({ message: 'Cook not found' });
//     res.json({ message: 'Cook deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };





// exports.addCook = async (req, res) => {
//   try {
//     const { name, experience, specialty, contactInfo, availability, rating, location } = req.body;
//     const newCook = new Cook({
//       name,
//       experience,
//       specialty,
//       contactInfo,
//       availability,
//       rating,
//       location,
//     });
//     await newCook.save();
//     res.status(201).json(newCook);
//   } catch (err) {
//     console.error('Add Cook Error:', err);
//     res.status(400).json({ message: err.message });
//   }
// };