import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ---- EDIT THESE TWO VALUES ----
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "your-password-here"; // set this before running the script
// --------------------------------

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Run this with:");
  console.error('  $env:MONGODB_URI="your_connection_string"; node scripts/createAdmin.mjs');
  process.exit(1);
}

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const existing = await Admin.findOne({ username: ADMIN_USERNAME.toLowerCase() });
  if (existing) {
    console.log(`Admin "${ADMIN_USERNAME}" already exists. Skipping.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await Admin.create({
    username: ADMIN_USERNAME.toLowerCase(),
    passwordHash,
  });

  console.log(`Admin "${ADMIN_USERNAME}" created successfully.`);
  console.log("You can now log in with the username and password you set in this script.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error creating admin:", err);
  process.exit(1);
});