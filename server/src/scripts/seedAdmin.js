const mongoose = require("mongoose");
const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = require("../config/env");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log("Connected to database");

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      await mongoose.disconnect();
      process.exit(0);
    }

    const admin = await User.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("Admin user created successfully:", admin.email);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed admin failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
