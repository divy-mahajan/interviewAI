require('dotenv').config();
const jwt = require('jsonwebtoken');
const autocannon = require('autocannon');

async function runAutocannonTest() {
    console.log("==================================================");
    console.log("BENCHMARK 2A: REST API LATENCY & CONCURRENCY (AUTOCANNON)");
    console.log("==================================================");

    const token = jwt.sign(
        { id: '6a4001c46be0f822ea4ccc33', username: 'test' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    console.log("[+] Target Endpoint: GET http://localhost:3000/api/messages/users");
    console.log("[+] Concurrency: 50 connections");
    console.log("[+] Duration: 10 seconds");
    console.log("[+] Running load test...\n");

    const result = await autocannon({
        url: 'http://localhost:3000/api/messages/users',
        connections: 50,
        duration: 10,
        headers: {
            Cookie: `token=${token}`
        }
    });

    console.log(autocannon.printResult(result));

    console.log("Structured Latency Metrics Summary:");
    console.log({
        endpoint: "/api/messages/users",
        concurrentConnections: 50,
        durationSeconds: 10,
        requestsTotal: result.requests.total,
        requestsAveragePerSec: result.requests.average,
        throughputBytesPerSec: result.throughput.average,
        latencyMs: {
            average: result.latency.average,
            p50: result.latency.p50,
            p90: result.latency.p90,
            p97_5: result.latency.p97_5,
            p99: result.latency.p99,
            max: result.latency.max
        },
        errors: result.errors,
        timeouts: result.timeouts,
        non2xx: result.non2xx
    });

    console.log("\n[+] Benchmark 2A Completed Successfully.");
}

runAutocannonTest().catch(console.error);
