import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const cleanupRooms = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "nexus_db",
  });

  try {
    console.log("🔍 Checking current floors...");

    // Get all floors
    const [floors] = await connection.query(
      "SELECT * FROM floor_plans ORDER BY floor_number"
    );
    console.log("Current floors:", floors);

    // Get the floor_id for Floor 1 (Tầng 1)
    const [floor1] = (await connection.query(
      "SELECT id FROM floor_plans WHERE floor_number = 1 OR name LIKE '%Tầng 1%' LIMIT 1"
    )) as any;

    if (floor1.length === 0) {
      console.log("⚠️ Floor 1 not found! Checking all floors...");
      const [allFloors] = (await connection.query(
        "SELECT id, floor_number, name FROM floor_plans"
      )) as any;
      console.log("All floors:", allFloors);
      return;
    }

    const floor1Id = floor1[0].id;
    console.log("✅ Floor 1 ID:", floor1Id);

    // Delete rooms not on Floor 1
    console.log("🗑️ Deleting rooms not on Floor 1...");
    const [deleteRoomsResult] = (await connection.execute(
      "DELETE FROM meeting_rooms WHERE floor_id != ?",
      [floor1Id]
    )) as any;
    console.log(`Deleted ${deleteRoomsResult.affectedRows} rooms`);

    // Delete floors other than Floor 1
    console.log("🗑️ Deleting floors other than Floor 1...");
    const [deleteFloorsResult] = (await connection.execute(
      "DELETE FROM floor_plans WHERE id != ?",
      [floor1Id]
    )) as any;
    console.log(`Deleted ${deleteFloorsResult.affectedRows} floors`);

    // Show remaining data
    console.log("\n📊 Remaining data:");
    const [remainingFloors] = await connection.query(
      "SELECT * FROM floor_plans"
    );
    console.log("Floors:", remainingFloors);

    const [remainingRooms] = await connection.query(
      "SELECT id, name, floor_id, capacity FROM meeting_rooms"
    );
    console.log("Rooms:", remainingRooms);

    console.log("\n✅ Cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    await connection.end();
  }
};

cleanupRooms();
