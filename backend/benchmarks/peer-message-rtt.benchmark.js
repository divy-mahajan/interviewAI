require('dotenv').config();
const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

async function measurePeerMessageRtt() {
    const SERVER_URL = 'http://localhost:3000';
    const userA_id = '6a4001c46be0f822ea4ccc33'; // 'test'
    const userB_id = '6a4004496be0f822ea4ccc34'; // 'test_2'

    const tokenA = jwt.sign({ id: userA_id, username: 'test' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Connect User B socket
    const socketB = io(SERVER_URL, { query: { userId: userB_id }, transports: ['websocket'] });
    await new Promise(r => socketB.on('connect', r));

    const latencies = [];

    for (let i = 0; i < 10; i++) {
        const payload = `rtt-test-${i}-${Date.now()}`;
        const t0 = process.hrtime.bigint();

        await new Promise(async (resolve) => {
            const onMsg = (msg) => {
                if (msg.text === payload) {
                    const t1 = process.hrtime.bigint();
                    latencies.push(Number(t1 - t0) / 1e6);
                    socketB.off('newMessage', onMsg);
                    resolve();
                }
            };
            socketB.on('newMessage', onMsg);

            await fetch(`${SERVER_URL}/api/messages/send/${userB_id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': `token=${tokenA}` },
                body: JSON.stringify({ text: payload })
            });
        });
    }

    socketB.disconnect();

    const sorted = [...latencies].sort((a, b) => a - b);
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;

    console.log("PEER_MESSAGE_END_TO_END_RTT:", {
        iterations: 10,
        minMs: sorted[0].toFixed(2),
        avgMs: avg.toFixed(2),
        p50Ms: sorted[Math.floor(sorted.length * 0.5)].toFixed(2),
        p90Ms: sorted[Math.floor(sorted.length * 0.9)].toFixed(2),
        maxMs: sorted[sorted.length - 1].toFixed(2)
    });
}

measurePeerMessageRtt().catch(console.error);
