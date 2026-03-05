// Quick test file for lootbox reward generation
import { state } from "./js/state.js";
import { applyReward, generateReward } from "./js/systems/lootbox.js";

console.log("🧪 Testing Lootbox Reward System");

// Test 1: Generate rewards from each rarity
console.log("\n📊 Testing reward generation from each rarity:");
["common", "uncommon", "rare", "epic", "legendary"].forEach((rarityId) => {
  for (let i = 0; i < 5; i++) {
    const reward = generateReward(rarityId, 10);
    if (reward.type === "random_building" || reward.type === "random_upgrade") {
      console.log(`✅ ${rarityId} (tier1): Generated ${reward.type}`);
    }
  }
});

// Test 2: Apply rewards to state
console.log("\n🎁 Testing reward application:");

// Create a copy of state for testing
const testState = JSON.parse(JSON.stringify(state));

// Test random building reward
console.log("\n  Testing RANDOM_BUILDING:");
const buildingReward = { type: "random_building" };
const buildingSummary = applyReward(testState, buildingReward);
console.log(`  📦 Reward applied: ${buildingSummary.display}`);
console.log(`  🏗️  Building key: ${buildingSummary.buildingKey}`);

// Test random upgrade reward
console.log("\n  Testing RANDOM_UPGRADE:");
const upgradeReward = { type: "random_upgrade" };
const upgradeSummary = applyReward(testState, upgradeReward);
console.log(`  📦 Reward applied: ${upgradeSummary.display}`);
console.log(`  ⭐ Upgrade key: ${upgradeSummary.upgradeKey}`);

console.log("\n✅ All tests completed!");
