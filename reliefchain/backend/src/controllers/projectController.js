const Project = require('../models/Project');
const { createProjectSchema } = require('../validations/projectSchema');

const mockProjects = [
  {
    _id: '1',
    name: "Emergency Medical Aid - Kerala Flood Relief",
    description: "Providing first-aid kits, essential emergency medicines, and temporary field support clinics for affected families in flooding zones.",
    location: "Kerala, India",
    targetAmount: 500000,
    raisedAmount: 120000,
    status: "ACTIVE",
    imageIcon: "🏥",
    bannerImage: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=800&auto=format&fit=crop",
    ngoAddress: "0x1234567890123456789012345678901234567890"
  },
  {
    _id: '2',
    name: "Cyclone Relief - Essential Food Distribution",
    description: "Distributing dry rations, drinking water, and cooked meals to support fishermen and families displaced by cyclone coastal areas.",
    location: "Odisha, India",
    targetAmount: 350000,
    raisedAmount: 95000,
    status: "ACTIVE",
    imageIcon: "🍲",
    bannerImage: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop",
    ngoAddress: "0x1234567890123456789012345678901234567891"
  },
  {
    _id: '3',
    name: "Temporary Shelter Kits for Earthquake Victims",
    description: "Sponsoring waterproof tents, sleeping bags, and thermal mats for families who lost their homes in recent earthquake tremors.",
    location: "Bihar, India",
    targetAmount: 800000,
    raisedAmount: 420000,
    status: "ACTIVE",
    imageIcon: "⛺",
    bannerImage: "https://images.unsplash.com/photo-1504159506876-f8338247a14a?q=80&w=800&auto=format&fit=crop",
    ngoAddress: "0x1234567890123456789012345678901234567892"
  },
  {
    _id: '4',
    name: "Safe Drinking Water - Drought Response",
    description: "Installing portable water filtration units and arranging water tankers for rural villages facing extreme drought and water scarcity.",
    location: "Rajasthan, India",
    targetAmount: 250000,
    raisedAmount: 180000,
    status: "ACTIVE",
    imageIcon: "💧",
    bannerImage: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop",
    ngoAddress: "0x1234567890123456789012345678901234567893"
  }
];

exports.getAll = async (req, res, next) => {
  try {
    if (global.dbConnected === false) return res.json({ success: true, count: mockProjects.length, data: mockProjects });
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.json({ success: true, count: mockProjects.length, data: mockProjects, warning: 'Offline mode' });
  }
};

exports.getById = async (req, res, next) => {
  try {
    if (global.dbConnected === false) {
      const project = mockProjects.find(p => p._id === req.params.id);
      return project ? res.json({ success: true, data: project }) : res.status(404).json({ success: false, error: 'Project not found' });
    }
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    const project = mockProjects.find(p => p._id === req.params.id);
    return project ? res.json({ success: true, data: project }) : res.status(404).json({ success: false, error: 'Project not found' });
  }
};

exports.create = async (req, res, next) => {
  try {
    // Note: in a real app, logic to ensure caller is a verified NGO goes here.
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};
