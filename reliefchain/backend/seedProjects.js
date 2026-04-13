const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('./src/models/Project'); // relative path to Project.js

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reliefchain';

const sampleProjects = [
  {
    name: "Emergency Medical Aid - Kerala Flood Relief",
    description: "Providing first-aid kits, essential emergency medicines, and temporary field support clinics for affected families in flooding zones.",
    location: "Kerala, India",
    targetAmount: 500000,
    raisedAmount: 120000,
    status: "ACTIVE",
    imageIcon: "🏥",
    bannerImage: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=800&auto=format&fit=crop",
    ngoAddress: "0x1234567890123456789012345678901234567890" // static placeholder address
  },
  {
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
    name: "Temporary Shelter Kits for Earthquake Victims",
    description: "Sponsoring waterproof tents, sleeping bags, and thermal mats for families who lost their homes in recent earthquake tremors.",
    location: "Bihar, India",
    targetAmount: 800000,
    raisedAmount: 420000,
    status: "ACTIVE",
    imageIcon: "⛺",
    bannerImage: "https://images.unsplash.com/photo-1542362567-b50033adab9a?q=80&w=800&auto=format&fit=crop",
    ngoAddress: "0x1234567890123456789012345678901234567892"
  },
  {
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

async function seed() {
  try {
    console.log("Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB established. Clearing existing projects...");
    
    await Project.deleteMany({}); // Optional: clear existing to restart fresh
    console.log("Existing projects cleared.");

    await Project.insertMany(sampleProjects);
    console.log("Successfully seeded", sampleProjects.length, "campaigns!");
    
    process.exit(0);
  } catch (err) {
    console.error("Error seeding projects:", err);
    process.exit(1);
  }
}

seed();
