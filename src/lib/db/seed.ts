import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { categories, users } from "./schema";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const CATEGORIES = [
  { name: "5 Ritmos", slug: "5-ritmos", color: "#E8654A", emoji: "💃", sortOrder: 1 },
  { name: "Ecstatic Dance", slug: "ecstatic-dance", color: "#9B59B6", emoji: "🌀", sortOrder: 2 },
  { name: "Contact Improvisation", slug: "contact-impro", color: "#3498DB", emoji: "🤝", sortOrder: 3 },
  { name: "Biodanza", slug: "biodanza", color: "#E67E22", emoji: "🌿", sortOrder: 4 },
  { name: "Danza Contemporánea", slug: "danza-contemporanea", color: "#1ABC9C", emoji: "✨", sortOrder: 5 },
  { name: "Yoga", slug: "yoga", color: "#27AE60", emoji: "🧘", sortOrder: 6 },
  { name: "Meditación en Movimiento", slug: "meditacion-movimiento", color: "#F39C12", emoji: "🕊️", sortOrder: 7 },
  { name: "Breathwork", slug: "breathwork", color: "#2ECC71", emoji: "🌬️", sortOrder: 8 },
  { name: "Sound Healing", slug: "sound-healing", color: "#8E44AD", emoji: "🔔", sortOrder: 9 },
  { name: "Tarot y Astrología", slug: "tarot-astrologia", color: "#C0392B", emoji: "🔮", sortOrder: 10 },
  { name: "Constelaciones Familiares", slug: "constelaciones", color: "#D35400", emoji: "🌟", sortOrder: 11 },
  { name: "Terapias Holísticas", slug: "terapias-holisticas", color: "#16A085", emoji: "🌱", sortOrder: 12 },
  { name: "Teatro y Artes Escénicas", slug: "teatro-artes", color: "#2C3E50", emoji: "🎭", sortOrder: 13 },
  { name: "Eventos Especiales", slug: "eventos-especiales", color: "#E74C3C", emoji: "🎪", sortOrder: 14 },
];

async function seed() {
  console.log("Seeding categories...");
  for (const cat of CATEGORIES) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }
  console.log(`${CATEGORIES.length} categories seeded.`);

  // Create admin user
  const adminEmail = "gabi@example.com"; // Cambiar por tu email real
  const adminPassword = await bcrypt.hash("admin123", 10);

  await db
    .insert(users)
    .values({
      name: "Gabi",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    })
    .onConflictDoNothing();
  console.log(`Admin user created: ${adminEmail}`);

  console.log("Seed complete!");
}

seed().catch(console.error);
