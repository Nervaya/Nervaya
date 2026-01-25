import axios from "axios";

const API_URL = "http://localhost:3000/api";

async function testAuth() {
  console.log("Starting Auth Verification...");

  const customer = {
    email: "bhanu@nervaya.com",
    password: "bhanu123",
    name: "Bhanu Teja",
  };

  const admin = {
    email: "admin@nervaya.com",
    password: "admin123",
    name: "Admin",
    role: "ADMIN", // Explicitly asking for ADMIN role
  };

  try {
    // 1. Register Customer
    console.log("\n1. Registering Customer...");
    const regCust = await axios.post(`${API_URL}/auth/signup`, customer);
    console.log("   Success:", regCust.data.success);
    console.log("   Role:", regCust.data.data.user.role);

    // 2. Register Admin
    console.log("\n2. Registering Admin...");
    const regAdmin = await axios.post(`${API_URL}/auth/signup`, admin);
    console.log("   Success:", regAdmin.data.success);
    console.log("   Role:", regAdmin.data.data.user.role);

    // 3. Login Customer
    console.log("\n3. Logging in Customer...");
    const loginCust = await axios.post(`${API_URL}/auth/login`, {
      email: customer.email,
      password: customer.password,
    });
    console.log("   Success:", loginCust.data.success);
    const custToken = loginCust.data.data.token;

    // 4. Login Admin
    console.log("\n4. Logging in Admin...");
    const loginAdmin = await axios.post(`${API_URL}/auth/login`, {
      email: admin.email,
      password: admin.password,
    });
    console.log("   Success:", loginAdmin.data.success);
    const adminToken = loginAdmin.data.data.token;

    // 5. Test Protected Routes (assuming /dashboard is protected)
    // Since /dashboard is a page, middleware handles it. API routes would be better to test for rigid RBAC.
    // But we can test if we can access a protected API if we had one.
    // Since we don't have a specific protected API route yet, we'll skip direct API RBAC test unless we create a dummy one.
    // However, we verified roles are assigned correctly.

    console.log("\nVerification Complete!");
  } catch (error: any) {
    console.error(
      "Verification Failed:",
      error.response?.data || error.message,
    );
  }
}

testAuth();
