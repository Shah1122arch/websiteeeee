import { conjureIdea } from "../lib/ai";

/**
 * Diagnostic script to verify Gemini AI connectivity
 * Run with: npx ts-node scratch/test-ai.ts
 */
async function testAI() {
  console.log("🧪 Starting AI Connectivity Diagnostic...");
  
  const testGenres = ["Sci-Fi", "Fantasy", "Horror"];
  
  for (const genre of testGenres) {
    console.log(`\n--- Testing Genre: ${genre} ---`);
    try {
      const result = await conjureIdea("A story about lost time", genre, "dramatic", "cinematic");
      console.log("✅ SUCCESS:");
      console.log(JSON.stringify(result, null, 2));
    } catch (err: any) {
      console.error("❌ FAILED:");
      console.error(err.message);
    }
  }
  
  console.log("\n🏁 Diagnostic Complete.");
}

testAI();
