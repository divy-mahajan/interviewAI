require('dotenv').config();
const mongoose = require('mongoose');

async function runDbBenchmark() {
    console.log("==================================================");
    console.log("BENCHMARK 3: MONGODB DATABASE QUERY OPTIMIZATION");
    console.log("==================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("[+] Connected to MongoDB Atlas");

    const db = mongoose.connection.db;
    const messagesCol = db.collection('messages');

    // Define target test user IDs
    const userA = new mongoose.Types.ObjectId("6a4001c46be0f822ea4ccc33");
    const userB = new mongoose.Types.ObjectId("6a4004496be0f822ea4ccc34");

    // Other random users
    const otherUsers = Array.from({ length: 25 }, () => new mongoose.Types.ObjectId());

    // 1. Seed 1,000 documents
    console.log("[+] Seeding 1,000 documents into 'messages' collection...");
    const mockMessages = [];
    const now = Date.now();

    for (let i = 0; i < 1000; i++) {
        let sender, receiver;
        if (i % 20 === 0) {
            // Target conversation (approx 50 messages)
            sender = i % 2 === 0 ? userA : userB;
            receiver = i % 2 === 0 ? userB : userA;
        } else {
            // Background noise traffic between other users
            const sIdx = Math.floor(Math.random() * otherUsers.length);
            let rIdx = Math.floor(Math.random() * otherUsers.length);
            while (rIdx === sIdx) rIdx = Math.floor(Math.random() * otherUsers.length);
            sender = otherUsers[sIdx];
            receiver = otherUsers[rIdx];
        }

        mockMessages.push({
            senderId: sender,
            receiverId: receiver,
            messageType: 'text',
            text: `Benchmark mock message #${i + 1}: discussing interview prep problem`,
            createdAt: new Date(now - (1000 - i) * 60000),
            updatedAt: new Date(now - (1000 - i) * 60000),
            isBenchmarkMock: true
        });
    }

    await messagesCol.insertMany(mockMessages);
    const totalCount = await messagesCol.countDocuments();
    console.log(`[+] Total documents in messages collection: ${totalCount}`);

    // 2. Ensure indexes are dropped for unindexed baseline test
    try {
        await messagesCol.dropIndex("senderId_1_receiverId_1_createdAt_1");
        await messagesCol.dropIndex("receiverId_1_senderId_1_createdAt_1");
        console.log("[+] Dropped target compound indexes for baseline test");
    } catch (e) {
        // Indexes didn't exist, which is expected
    }

    const query = {
        $or: [
            { senderId: userA, receiverId: userB },
            { senderId: userB, receiverId: userA }
        ]
    };

    // 3. Measure Unindexed (COLLSCAN) performance
    console.log("[+] Running UNINDEXED query explain('executionStats')...");
    const unindexedExplain = await messagesCol.find(query).sort({ createdAt: 1 }).explain("executionStats");
    const unindexedStats = unindexedExplain.executionStats;

    // Warm-up and multi-iteration timing for reliable time measurement
    let unindexedTimes = [];
    for (let i = 0; i < 5; i++) {
        const t0 = process.hrtime.bigint();
        await messagesCol.find(query).sort({ createdAt: 1 }).toArray();
        const t1 = process.hrtime.bigint();
        unindexedTimes.push(Number(t1 - t0) / 1e6);
    }
    const unindexedAvgTimeMs = (unindexedTimes.reduce((a, b) => a + b, 0) / unindexedTimes.length);

    console.log(`    - Plan stage: ${unindexedStats.executionStages.stage}`);
    console.log(`    - Total Docs Examined: ${unindexedStats.totalDocsExamined}`);
    console.log(`    - Documents Returned: ${unindexedStats.nReturned}`);
    console.log(`    - Explain executionTimeMillis: ${unindexedStats.executionTimeMillis} ms`);
    console.log(`    - Real Query Average Latency: ${unindexedAvgTimeMs.toFixed(2)} ms`);

    // 4. Create compound index
    console.log("[+] Creating compound indexes on { senderId: 1, receiverId: 1, createdAt: 1 } and { receiverId: 1, senderId: 1, createdAt: 1 }...");
    await messagesCol.createIndex({ senderId: 1, receiverId: 1, createdAt: 1 }, { name: "senderId_1_receiverId_1_createdAt_1" });
    await messagesCol.createIndex({ receiverId: 1, senderId: 1, createdAt: 1 }, { name: "receiverId_1_senderId_1_createdAt_1" });
    console.log("[+] Compound indexes created successfully");

    // 5. Measure Indexed (IXSCAN) performance
    console.log("[+] Running INDEXED query explain('executionStats')...");
    const indexedExplain = await messagesCol.find(query).sort({ createdAt: 1 }).explain("executionStats");
    const indexedStats = indexedExplain.executionStats;

    let indexedTimes = [];
    for (let i = 0; i < 5; i++) {
        const t0 = process.hrtime.bigint();
        await messagesCol.find(query).sort({ createdAt: 1 }).toArray();
        const t1 = process.hrtime.bigint();
        indexedTimes.push(Number(t1 - t0) / 1e6);
    }
    const indexedAvgTimeMs = (indexedTimes.reduce((a, b) => a + b, 0) / indexedTimes.length);

    console.log(`    - Plan stage: ${indexedStats.executionStages.stage}`);
    console.log(`    - Total Docs Examined: ${indexedStats.totalDocsExamined}`);
    console.log(`    - Total Keys Examined: ${indexedStats.totalKeysExamined}`);
    console.log(`    - Documents Returned: ${indexedStats.nReturned}`);
    console.log(`    - Explain executionTimeMillis: ${indexedStats.executionTimeMillis} ms`);
    console.log(`    - Real Query Average Latency: ${indexedAvgTimeMs.toFixed(2)} ms`);

    // 6. Calculate Improvement Deltas
    const docsExaminedReduction = ((unindexedStats.totalDocsExamined - indexedStats.totalDocsExamined) / unindexedStats.totalDocsExamined) * 100;
    const latencyReduction = ((unindexedAvgTimeMs - indexedAvgTimeMs) / unindexedAvgTimeMs) * 100;

    const results = {
        collection: "messages",
        totalCollectionDocs: totalCount,
        queryDescription: "Find messages between User A and User B ordered chronologically",
        unindexed: {
            stage: unindexedStats.executionStages.stage,
            docsExamined: unindexedStats.totalDocsExamined,
            keysExamined: unindexedStats.totalKeysExamined,
            returned: unindexedStats.nReturned,
            explainTimeMillis: unindexedStats.executionTimeMillis,
            realAvgLatencyMs: Number(unindexedAvgTimeMs.toFixed(2))
        },
        indexed: {
            stage: indexedStats.executionStages.stage,
            docsExamined: indexedStats.totalDocsExamined,
            keysExamined: indexedStats.totalKeysExamined,
            returned: indexedStats.nReturned,
            explainTimeMillis: indexedStats.executionTimeMillis,
            realAvgLatencyMs: Number(indexedAvgTimeMs.toFixed(2))
        },
        optimizationDelta: {
            docsExaminedReductionPct: Number(docsExaminedReduction.toFixed(2)),
            latencyReductionPct: Number(latencyReduction.toFixed(2)),
            ratioOfDocsScannedToReturnedBefore: `${(unindexedStats.totalDocsExamined / unindexedStats.nReturned).toFixed(1)} : 1`,
            ratioOfDocsScannedToReturnedAfter: `${(indexedStats.totalDocsExamined / indexedStats.nReturned).toFixed(1)} : 1`
        }
    };

    console.log("\n==================== BENCHMARK 3 RESULTS ====================");
    console.log(JSON.stringify(results, null, 2));
    console.log("=============================================================");

    // 7. Cleanup mock seeded data
    console.log("[+] Cleaning up mock seeded documents...");
    const delResult = await messagesCol.deleteMany({ isBenchmarkMock: true });
    console.log(`[+] Deleted ${delResult.deletedCount} benchmark documents`);

    await mongoose.disconnect();
    console.log("[+] Benchmark 3 Completed Successfully.");
}

runDbBenchmark().catch(err => {
    console.error("Benchmark failed:", err);
    process.exit(1);
});
