const mongoose = require('mongoose');
const Project = require('../models/Project');
require('dotenv').config();

const mockProjects = [
  {
    name: "Tsunami Relief - Southeast Asia",
    description: "Immediate critical response fund for coastal communities affected by the recent 7.8 magnitude earthquake.",
    raisedAmount: 45000,
    targetAmount: 100000,
    imageIcon: "🌊",
    bannerImage: "https://images.unsplash.com/photo-1549646875-19e072fcc092?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    status: "ACTIVE"
  },
  {
    name: "Wildfire Recovery - California",
    description: "Rebuilding infrastructure and providing shelter for families displaced by the ongoing state-wide wildfires.",
    raisedAmount: 12500,
    targetAmount: 50000,
    imageIcon: "🔥",
    bannerImage: "https://images.unsplash.com/photo-1600008511659-4b423194a0d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    status: "ACTIVE"
  },
  {
    name: "Medical Supplies - East Africa",
    description: "Provisioning vaccines, clean water filtration, and mobile clinics to remote regions experiencing outbreaks.",
    raisedAmount: 89000,
    targetAmount: 90000,
    imageIcon: "⚕️",
    bannerImage: "https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    status: "COMPLETED"
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reliefchain');
    console.log('Connected to DB');

    await Project.deleteMany();
    console.log('Wiped existing projects');

    await Project.insertMany(mockProjects);
    console.log(`Seeded ${mockProjects.length} projects successfully`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedDB();
