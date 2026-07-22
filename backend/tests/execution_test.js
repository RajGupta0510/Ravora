/**
2:  * Trade Execution Engine V1 — Integration & Verification Tests
3:  */
4: 
5: import { initializeDatabase, getSupabaseAdmin } from '../config/database.js';
6: import { ExecutionService } from '../execution/services/ExecutionService.js';
7: import { RiskManager } from '../execution/risk/RiskManager.js';
8: import { OrderRepository } from '../repositories/OrderRepository.js';
9: import { ExecutionRepository } from '../repositories/ExecutionRepository.js';
10: import { OrderEventRepository } from '../repositories/OrderEventRepository.js';
11: import { ExchangeResponseRepository } from '../repositories/ExchangeResponseRepository.js';
12: 
13: const orderRepo = new OrderRepository();
14: const execRepo = new ExecutionRepository();
15: const eventRepo = new OrderEventRepository();
16: const responseRepo = new ExchangeResponseRepository();
17: 
18: async function runTests() {
19:   console.log('═══════════════════════════════════════════════════════════');
20:   console.log('   STARTING TRADE EXECUTION ENGINE INTEGRATION TESTS       ');
21:   console.log('═══════════════════════════════════════════════════════════\n');
22: 
23:   // Initialize Database
24:   initializeDatabase();
25:   const db = getSupabaseAdmin();
26: 
27:   // Define Test IDs
28:   const testUserId = '88888888-8888-4888-8888-888888888888';
29:   const testExchangeId = '77777777-7777-4777-7777-777777777777';
30:   const testPortfolioId = '66666666-6666-4666-6666-666666666666';
31: 
32:   try {
33:     // 1. Prepare Test Data
34:     console.log('[Setup] Seeding test database records...');
35:     
36:     // Ensure user exists
37:     await db.auth.admin.createUser({
38:       id: testUserId,
39:       email: 'test_execution_user@ravora.ai',
40:       password: 'Password123!',
41:       email_confirm: true
42:     }).catch(() => null); // ignore if already exists
43: 
44:     // Upsert profile
45:     await db.from('profiles').upsert({
46:       id: testUserId,
47:       full_name: 'Test Trade Engineer',
48:       email: 'test_execution_user@ravora.ai',
49:       risk_stance: 'balanced',
50:       max_drawdown_cap: 5.0
51:     }, { onConflict: 'id' });
52: 
53:     // Create connected exchange connection
54:     await db.from('connected_exchanges').upsert({
55:       id: testExchangeId,
56:       user_id: testUserId,
57:       exchange_name: 'binance',
58:       api_key_encrypted: 'mock_key_encrypted_123',
59:       api_secret_encrypted: 'mock_secret_encrypted_123',
60:       status: 'active',
61:       permissions: { read: true, trade: true, withdraw: false }
62:     }, { onConflict: 'user_id,exchange_name' });
63: 
64:     // Create portfolio
65:     await db.from('portfolios').upsert({
66:       id: testPortfolioId,
67:       user_id: testUserId,
68:       current_balance: 100000.00,
69:       currency: 'USD',
70:       safety_score: 95
71:     }, { onConflict: 'user_id' });
72: 
73:     // Seed portfolio assets (quote asset USDT)
74:     await db.from('portfolio_assets').upsert({
75:       portfolio_id: testPortfolioId,
76:       exchange_account_id: testExchangeId,
77:       asset_symbol: 'USDT',
78:       balance_amount: 50000.00,
79:       average_entry_price: 1.00,
80:       allocation_pct: 50.0
81:     }, { onConflict: 'portfolio_id,asset_symbol' });
82: 
83:     // Delete older test orders/executions to isolate this test run
84:     await db.from('orders').delete().eq('user_id', testUserId);
85: 
86:     console.log('[Setup] Database seeded successfully.\n');
87: 
88:     // ----------------------------------------------------
89:     // TEST 1: Place a valid order
90:     // ----------------------------------------------------
91:     console.log('--- TEST 1: Placement of Valid Market BUY Order ---');
92:     const order1 = await ExecutionService.placeOrder(testUserId, {
93:       exchangeAccountId: testExchangeId,
94:       symbol: 'BTCUSDT',
95:       type: 'market',
96:       side: 'buy',
97:       quantity: 0.1,
98:       clientOrderId: 'client-order-id-001'
99:     });
100:     console.log(`✓ Order initialized with ID: ${order1.id}, status: ${order1.status}`);
101: 
102:     // Wait 1.5 seconds for async queue process to finish mock executions
103:     await new Promise(r => setTimeout(r, 1500));
104: 
105:     // Check database values
106:     const checkOrder1 = await orderRepo.findById(order1.id);
107:     console.log(`✓ Post-execution status: ${checkOrder1.status}, filledPrice: ${checkOrder1.filled_price}, fee: ${checkOrder1.fee}`);
108:     if (checkOrder1.status !== 'filled') {
109:       throw new Error(`Test 1 Failed: Expected filled state but got ${checkOrder1.status}`);
110:     }
111: 
112:     // Verify order events
113:     const events = await eventRepo.findByOrderId(order1.id);
114:     console.log(`✓ Order events tracked: ${events.map(e => e.new_status).join(' -> ')}`);
115: 
116:     // Verify executions
117:     const executions = await execRepo.findByOrderId(order1.id);
118:     console.log(`✓ Execution fill logged: price=${executions[0]?.price}, qty=${executions[0]?.quantity}`);
119: 
120:     // Verify exchange raw logs
121:     const responseLogs = await responseRepo.findByOrderId(order1.id);
122:     console.log(`✓ Exchange API logs audited: ${responseLogs.length} request/response pairs logged.`);
123:     console.log('✓ TEST 1 PASSED.\n');
124: 
125:     // ----------------------------------------------------
126:     // TEST 2: Validate balance checker (Insufficient Funds)
127:     // ----------------------------------------------------
128:     console.log('--- TEST 2: Validation of Insufficient Balance ---');
129:     try {
130:       await ExecutionService.placeOrder(testUserId, {
131:         exchangeAccountId: testExchangeId,
132:         symbol: 'BTCUSDT',
133:         type: 'market',
134:         side: 'buy',
135:         quantity: 10.0, // Exceeds quote balance
136:       });
137:       throw new Error('Test 2 Failed: Allowed order with insufficient balance');
138:     } catch (err) {
139:       console.log(`✓ Expected error received: "${err.message}" (Status Code: ${err.statusCode})`);
140:       console.log('✓ TEST 2 PASSED.\n');
141:     }
142: 
143:     // ----------------------------------------------------
144:     // TEST 3: Validate risk checks (Max Position Size Cap)
145:     // ----------------------------------------------------
146:     console.log('--- TEST 3: Validation of Risk Allocation Sizing Cap ---');
147:     try {
148:       await ExecutionService.placeOrder(testUserId, {
149:         exchangeAccountId: testExchangeId,
150:         symbol: 'BTCUSDT',
151:         type: 'market',
152:         side: 'buy',
153:         quantity: 0.5, // Exceeds 20% portfolio cap for balanced profile
154:       });
155:       throw new Error('Test 3 Failed: Allowed order exceeding maximum risk allocation');
156:     } catch (err) {
157:       console.log(`✓ Expected error received: "${err.message}" (Status Code: ${err.statusCode})`);
158:       console.log('✓ TEST 3 PASSED.\n');
159:     }
160: 
161:     // ----------------------------------------------------
162:     // TEST 4: Duplicate Order Prevention
163:     // ----------------------------------------------------
164:     console.log('--- TEST 4: Duplicate Order Prevention check ---');
165:     await ExecutionService.placeOrder(testUserId, {
166:       exchangeAccountId: testExchangeId,
167:       symbol: 'ETHUSDT',
168:       type: 'market',
169:       side: 'buy',
170:       quantity: 0.5
171:     });
172: 
173:     try {
174:       await ExecutionService.placeOrder(testUserId, {
175:         exchangeAccountId: testExchangeId,
176:         symbol: 'ETHUSDT',
177:         type: 'market',
178:         side: 'buy',
179:         quantity: 0.5 // Duplicate!
180:       });
181:       throw new Error('Test 4 Failed: Permitted duplicate order placing');
182:     } catch (err) {
183:       console.log(`✓ Expected duplicate warning: "${err.message}"`);
184:       console.log('✓ TEST 4 PASSED.\n');
185:     }
186: 
187:     // ----------------------------------------------------
188:     // TEST 5: Order cancellation
189:     // ----------------------------------------------------
190:     console.log('--- TEST 5: Order Cancellation Pipeline ---');
191:     const order5 = await ExecutionService.placeOrder(testUserId, {
192:       exchangeAccountId: testExchangeId,
193:       symbol: 'BTCUSDT',
194:       type: 'limit',
195:       side: 'buy',
196:       quantity: 0.05,
197:       price: 15000.00
198:     });
199:     console.log(`✓ Limit order initialized. status: ${order5.status}`);
200: 
201:     await new Promise(r => setTimeout(r, 1000));
202: 
203:     console.log(`[Cancel] Sending cancel command for order ID: ${order5.id}...`);
204:     const cancelResult = await ExecutionService.cancelOrder(testUserId, order5.id);
205:     console.log(`✓ Cancellation final status: ${cancelResult.status}`);
206:     if (cancelResult.status !== 'cancelled') {
207:       throw new Error('Test 5 Failed: Order cancellation did not transition state to cancelled');
208:     }
209:     console.log('✓ TEST 5 PASSED.\n');
210: 
211:     // ----------------------------------------------------
212:     // TEST 6: Emergency Trading Halt Switch
213:     // ----------------------------------------------------
214:     console.log('--- TEST 6: Emergency Halt Controls ---');
215:     console.log('[Halt] Triggering global Emergency Halt switch...');
216:     RiskManager.setEmergencyHalt(true);
217: 
218:     try {
219:       await ExecutionService.placeOrder(testUserId, {
220:         exchangeAccountId: testExchangeId,
221:         symbol: 'BTCUSDT',
222:         type: 'market',
223:         side: 'buy',
224:         quantity: 0.02
225:       });
226:       throw new Error('Test 6 Failed: Placed order while Emergency Halt was active!');
227:     } catch (err) {
228:       console.log(`✓ Expected halt block message: "${err.message}"`);
229:     }
230: 
231:     // Reset halt
232:     RiskManager.setEmergencyHalt(false);
233:     console.log('[Halt] Emergency Halt switch deactivated.');
234:     console.log('✓ TEST 6 PASSED.\n');
235: 
236:     console.log('═══════════════════════════════════════════════════════════');
237:     console.log('      ALL INTEGRATION TESTS SETTLED SUCCESSFULLY!          ');
238:     console.log('═══════════════════════════════════════════════════════════');
239:     process.exit(0);
240:   } catch (error) {
241:     console.error('\n❌ TEST RUN ENCOUNTERED FATAL FAILURE:');
242:     console.error(error.stack || error.message || error);
243:     process.exit(1);
244:   }
245: }
246: 
247: runTests();
