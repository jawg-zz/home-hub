import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash("Demo123!", 10);

  console.log("[Seed] Creating/updating demo user with password: Demo123!");

  await prisma.user.upsert({
    where: { email: "demo@home.com" },
    update: {
      password: hashedPassword, // Update password if user exists
    },
    create: {
      email: "demo@home.com",
      password: hashedPassword,
      name: "Demo User",
      role: "admin",
    },
  });

  console.log("[Seed] Demo user ready: demo@home.com / Demo123!");

  // Create mock devices
  const devices = [
    {
      name: "Living Room Light",
      type: "light",
      room: "Living Room",
      status: "on",
      value: 80,
      online: true,
    },
    {
      name: "Bedroom Light",
      type: "light",
      room: "Bedroom",
      status: "off",
      value: 0,
      online: true,
    },
    {
      name: "Kitchen Light",
      type: "light",
      room: "Kitchen",
      status: "on",
      value: 100,
      online: true,
    },
    {
      name: "Front Door Lock",
      type: "lock",
      room: "Entrance",
      status: "locked",
      value: 1,
      online: true,
    },
    {
      name: "Thermostat",
      type: "thermostat",
      room: "Living Room",
      status: "on",
      value: 22,
      online: true,
    },
    {
      name: "Smart Plug",
      type: "plug",
      room: "Office",
      status: "off",
      value: 0,
      online: true,
    },
    {
      name: "Garage Door",
      type: "garage",
      room: "Garage",
      status: "closed",
      value: 0,
      online: true,
    },
    {
      name: "Garden Sprinkler",
      type: "sprinkler",
      room: "Garden",
      status: "off",
      value: 0,
      online: false,
    },
  ];

  for (const device of devices) {
    await prisma.device.create({ data: device });
  }

  // Create sample shopping items
  const shoppingItems = [
    { name: "Milk", quantity: "2 liters" },
    { name: "Bread", quantity: "1 loaf" },
    { name: "Eggs", quantity: "1 dozen" },
    { name: "Tomatoes", quantity: "500g" },
    { name: "Chicken", quantity: "1kg" },
  ];

  for (const item of shoppingItems) {
    await prisma.shoppingItem.create({ data: item });
  }

  // Create sample chores (assignedTo must be null or valid user ID)
  const chores = [
    { title: "Wash dishes", assignedTo: null, completed: false },
    { title: "Vacuum living room", assignedTo: null, completed: true },
    { title: "Take out trash", assignedTo: null, completed: false },
    { title: "Water plants", assignedTo: null, completed: false },
  ];

  for (const chore of chores) {
    await prisma.chore.create({ data: chore });
  }

  // Create sample calendar events
  const today = new Date();
  const events = [
    {
      title: "Family Dinner",
      date: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        19,
        0,
      ),
      description: "At home",
    },
    {
      title: "Grocery Shopping",
      date: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 2,
        10,
        0,
      ),
      description: "Weekly shopping",
    },
    {
      title: "Movie Night",
      date: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 4,
        20,
        0,
      ),
      description: "Family movie",
    },
    {
      title: "School Play",
      date: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 7,
        18,
        0,
      ),
      description: "Kids school",
    },
  ];

  for (const event of events) {
    await prisma.calendarEvent.create({ data: event });
  }

  // Create sample energy readings
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const usage = 15 + Math.random() * 20;
    await prisma.energyReading.create({
      data: {
        date,
        usage,
        cost: usage * 0.15,
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
