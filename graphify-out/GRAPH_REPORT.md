# Graph Report - Ravora  (2026-10-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2893 nodes · 7178 edges · 115 communities (76 shown, 39 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 287 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0fc43780`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- $_
- BaseRepository
- dashboard.js
- r
- ApiError
- join
- backend/index.js
- e
- getSupabaseAdmin
- ExecutionQueue.js
- .toString
- tv
- Cn
- AiServiceInterface
- server.js
- authController.js
- .includes
- supportResistanceModels.js
- .push
- Ea
- constants.js
- Kw
- Rt
- pn
- scoringEngine.js
- UserService.js
- then
- Ci
- Q
- package.json
- binanceProvider.js
- AppContext.tsx
- mw
- scoringModels.js
- ._getOrReturnCtx
- MarketProviderInterface
- Ar
- NewsService.js
- auth-card.tsx
- ._debug
- momentumModels.js
- trendModels.js
- compilerOptions
- tradeModels.js
- onConnMessage
- src/database.js
- hr
- Be
- ._notifyAllSubscribers
- Je
- StrategyController.js
- poll
- pw
- .closeTrade
- riskService.js
- .add
- Ka
- dependencies
- decisionModels.js
- App.tsx
- ChartComponent
- WatchlistRepository
- nv
- constructor
- fw
- io
- PaperTradingRepository
- validator.js
- DrawingEngine
- connectWithFallback
- momentumEngine.js
- ExchangeInterface
- KrakenExchange
- ._callRefreshToken
- devDependencies
- BinanceExchange
- BybitExchange
- CoinbaseExchange
- OKXExchange
- Zs
- compilerOptions
- RealtimeDataService
- PositionService.js
- decisionService.js
- mathUtils.js
- app.js
- main.tsx
- reasoningGenerator.js
- ChartStateManager
- ApiResponse
- opportunityEngine.js
- RiskServiceOrchestrator
- ChartOverlayService
- OverlayManager
- MarketCacheRepository
- Ax
- .decode
- .dirty
- tradePlanGenerator.js
- aw
- SimpleCache
- OpportunityInteractionRepository
- bu
- src/middleware/auth.js
- AnnotationEngine
- ep
- np
- tsconfig.json
- models/index.js
- database.types.ts
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `$_` - 801 edges
2. `Ea()` - 82 edges
3. `BaseRepository` - 76 edges
4. `e()` - 76 edges
5. `Q()` - 64 edges
6. `r()` - 61 edges
7. `Cn` - 49 edges
8. `Kw` - 49 edges
9. `constructor()` - 48 edges
10. `join()` - 45 edges

## Surprising Connections (you probably didn't know these)
- `AuthCardPage()` --calls--> `User`  [EXTRACTED]
  components/ui/auth-card.tsx → src/context/AuthContext.tsx
- `startServer()` --calls--> `initializeDatabase()`  [EXTRACTED]
  server.js → src/database.js
- `AuthCardPage()` --calls--> `useAuth()`  [EXTRACTED]
  components/ui/auth-card.tsx → src/context/AuthContext.tsx
- `startEngineScheduler()` --calls--> `dbQuery()`  [EXTRACTED]
  server.js → src/database.js
- `runTest()` --calls--> `initializeDatabase()`  [EXTRACTED]
  backend/tests/test_discover_feed.js → backend/config/database.js

## Import Cycles
- None detected.

## Communities (115 total, 39 thin omitted)

### Community 0 - "$_"
Cohesion: 0.01
Nodes (113): $_, _0(), $1(), al(), b0(), binaryEncode(), Bw, $c() (+105 more)

### Community 1 - "BaseRepository"
Cohesion: 0.04
Nodes (19): AgentOrchestrator, auditRepo, cache, AIConversationsRepository, BaseRepository, getMemoryStore(), memoryStores, withTimeout() (+11 more)

### Community 2 - "dashboard.js"
Cohesion: 0.05
Nodes (94): animateValue(), apiCall(), appendCopilotMessage(), autoInjectTableLabels(), backgroundScanRefresh(), bindLadderRowEvents(), checkAuthState(), clearOtpTimers() (+86 more)

### Community 3 - "r"
Cohesion: 0.08
Nodes (89): ak(), am(), _b, bg(), d(), h(), i(), l() (+81 more)

### Community 4 - "ApiError"
Cohesion: 0.06
Nodes (36): RuleBasedReviewEngine, AdminController, DiscoverController, PortfolioController, ExchangeFactory, providers, jobs, JobScheduler (+28 more)

### Community 5 - "join"
Cohesion: 0.05
Nodes (62): bx(), cloneRequestState(), containedBy(), cx(), da(), db(), dx(), Em() (+54 more)

### Community 6 - "backend/index.js"
Cohesion: 0.06
Nodes (41): AiController, RATE_LIMITS, __dirname, env, envPath, __filename, rootDir, validateEnvironment() (+33 more)

### Community 7 - "e"
Cohesion: 0.05
Nodes (64): A_(), applyTransformOptsToQuery(), r(), cf(), Cg(), copy(), createBucket(), createIndex() (+56 more)

### Community 8 - "getSupabaseAdmin"
Cohesion: 0.06
Nodes (37): AiServiceFactory, runSseOrchestrator(), ConversationMemory, convRepo, AraivenPrompts, AiService, auditRepo, execRepo (+29 more)

### Community 9 - "ExecutionQueue.js"
Cohesion: 0.06
Nodes (26): ExecutionEvents, eventRepo, execRepo, ExecutionQueue, orderRepo, QueueManager, responseRepo, RiskManager (+18 more)

### Community 10 - ".toString"
Cohesion: 0.06
Nodes (12): Ac(), fh(), listBucketOptionsToQueryString(), listBuckets(), Na(), purgeBucketCache(), Ra(), Rr (+4 more)

### Community 11 - "tv"
Cohesion: 0.06
Nodes (53): Ae(), Au(), ch(), Cv(), Dd(), dh(), ed(), Eg() (+45 more)

### Community 12 - "Cn"
Cohesion: 0.05
Nodes (6): Ai(), Cn, Ru(), sm(), wr(), Xk()

### Community 13 - "AiServiceInterface"
Cohesion: 0.06
Nodes (6): AiServiceInterface, AnthropicProvider, AraivenProvider, GeminiProvider, MockAIProvider, OpenAIProvider

### Community 14 - "server.js"
Cohesion: 0.11
Nodes (38): apiRouter, app, __dirname, distPath, __filename, startEngineScheduler(), startServer(), changePassword() (+30 more)

### Community 15 - "authController.js"
Cohesion: 0.08
Nodes (41): @supabase/supabase-js, checkAccount(), checkPasswordStrength(), isSupabaseConfigured(), login(), rateLimitCheck(), rateLimits, register() (+33 more)

### Community 16 - ".includes"
Cohesion: 0.06
Nodes (35): a1(), af(), appendParams(), catch(), Dw(), endpointURL(), ey(), fb() (+27 more)

### Community 17 - "supportResistanceModels.js"
Cohesion: 0.08
Nodes (16): BaseStructureModel, BreakOfStructureModel, SwingPivotModel, MarketStructureService, MarketStructureServiceOrchestrator, classifyPivots(), detectStructuralBreaks(), findSwingPivots() (+8 more)

### Community 18 - ".push"
Cohesion: 0.08
Nodes (39): a0(), ah(), Bd(), e(), Ec(), eh(), es(), Fi() (+31 more)

### Community 19 - "Ea"
Cohesion: 0.13
Nodes (6): As(), Ba(), Ea(), et, _getAccessToken(), Sf()

### Community 20 - "constants.js"
Cohesion: 0.06
Nodes (27): API_PREFIX, API_VERSION, APP_NAME, DEFAULT_LIMIT, DEFAULT_PAGE, JOB_SCHEDULES, MARKET_PROVIDERS, MAX_LIMIT (+19 more)

### Community 22 - "Rt"
Cohesion: 0.08
Nodes (36): aa(), Ao(), d0(), delete(), Dv(), fm(), Fv(), gm() (+28 more)

### Community 23 - "pn"
Cohesion: 0.07
Nodes (34): ad(), s(), Br(), Di(), fn(), G1(), hh(), Ic() (+26 more)

### Community 24 - "scoringEngine.js"
Cohesion: 0.11
Nodes (10): MomentumService, BaseAnalyzer, MarketStructureAnalyzer, MomentumAnalyzer, PriceActionAnalyzer, SupportResistanceAnalyzer, TrendAnalyzer, VolumeAnalyzer (+2 more)

### Community 25 - "UserService.js"
Cohesion: 0.09
Nodes (18): SettingsController, UserController, AuditLogRepository, SettingsRepository, router, router, portfolioRepo, PortfolioService (+10 more)

### Community 26 - "then"
Cohesion: 0.14
Nodes (8): Bo(), Fs(), Qo(), sp, then(), Wo, Xr(), zf

### Community 27 - "Ci"
Cohesion: 0.10
Nodes (4): Ci, disconnect(), Ow(), rf()

### Community 28 - "Q"
Cohesion: 0.13
Nodes (6): ab(), _f(), lb, nn(), Pk(), Q()

### Community 29 - "package.json"
Cohesion: 0.07
Nodes (25): main, name, scripts, build, dev, preview, start, type (+17 more)

### Community 30 - "binanceProvider.js"
Cohesion: 0.11
Nodes (13): HISTORY_TTL_MS, TICKER_TTL_MS, ASSETS_TO_TRACK, BINANCE_SYMBOL_TO_SYMBOL, COINCAP_ID_TO_SYMBOL, SUPPORTED_ASSETS, SYMBOL_TO_BINANCE_SYMBOL, SYMBOL_TO_COINCAP_ID (+5 more)

### Community 31 - "AppContext.tsx"
Cohesion: 0.17
Nodes (19): DemoProps, lucide-react, react, AppDashboard(), CopilotChat(), OnboardingWizard(), OpportunitiesPanel(), PortfolioPanel() (+11 more)

### Community 33 - "scoringModels.js"
Cohesion: 0.12
Nodes (11): BaseScoringModel, ConfidenceScoreModel, MarketBiasModel, OpportunityScoreModel, evaluateMomentumScore(), evaluateSRScore(), evaluateStructureScore(), evaluateTrendScore() (+3 more)

### Community 34 - "._getOrReturnCtx"
Cohesion: 0.10
Nodes (10): Ap(), Ip(), kn, ms(), qf(), Rp(), Vu(), vy() (+2 more)

### Community 35 - "MarketProviderInterface"
Cohesion: 0.11
Nodes (9): MarketProviderInterface, BinanceMarketProvider, NAME_MAP, SYMBOL_MAP, COINGECKO_IDS, CoinGeckoMarketProvider, REVERSE_MAP, CMC_SYMBOLS (+1 more)

### Community 36 - "Ar"
Cohesion: 0.09
Nodes (13): Ar, Dn(), du, gf, hf, Ma, Ns(), P1 (+5 more)

### Community 37 - "NewsService.js"
Cohesion: 0.11
Nodes (13): NewsController, CryptoPanicNewsProvider, MockNewsProvider, NewsProviderInterface, router, IMPACT_CRITICAL, IMPACT_HIGH, memoryArticles (+5 more)

### Community 38 - "auth-card.tsx"
Cohesion: 0.10
Nodes (21): AuthCardPage(), emailOrPhoneSchema, ForgotFormValues, forgotSchema, getErrorMessage(), LoginFormValues, loginSchema, ResetFormValues (+13 more)

### Community 39 - "._debug"
Cohesion: 0.17
Nodes (5): B1(), ht(), kf(), M1(), za()

### Community 40 - "momentumModels.js"
Cohesion: 0.15
Nodes (8): BaseMomentumModel, MACDModel, RateOfChangeModel, RSIModel, MomentumServiceOrchestrator, calculateMACD(), calculateROC(), calculateRSI()

### Community 41 - "trendModels.js"
Cohesion: 0.15
Nodes (8): BaseTrendModel, ADXDirectionalModel, MarketStructurePivotModel, MovingAverageConfluenceModel, TrendServiceOrchestrator, calculateADX(), calculateEMA(), findPivots()

### Community 42 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, baseUrl, composite, isolatedModules, jsx, lib, module (+15 more)

### Community 43 - "tradeModels.js"
Cohesion: 0.18
Nodes (9): BreakoutTradeModel, MeanReversionTradeModel, PullbackTradeModel, BaseTradeModel, TradePlanningServiceOrchestrator, calculateRiskRewardRatio(), calculateTakeProfits(), calculateTradeProbability() (+1 more)

### Community 44 - "onConnMessage"
Cohesion: 0.14
Nodes (17): clearHeartbeats(), filterBindings(), flushSendBuffer(), hasLogger(), heartbeatTimeout(), isErrored(), isMember(), joinRef() (+9 more)

### Community 45 - "src/database.js"
Cohesion: 0.17
Nodes (12): sqlite3, getPaperTradeHistory(), updatePaperTradeNotes(), db, dbPath, __dirname, __filename, binanceProvider (+4 more)

### Community 46 - "hr"
Cohesion: 0.16
Nodes (7): bb, Bn(), Do(), hr, jf(), mb, Xi

### Community 48 - "._notifyAllSubscribers"
Cohesion: 0.23
Nodes (5): bf(), t_(), U1(), We(), Wt()

### Community 49 - "Je"
Cohesion: 0.11
Nodes (4): by(), Je, ku, us()

### Community 50 - "StrategyController.js"
Cohesion: 0.14
Nodes (9): BacktestEngine, PatternDetector, TechnicalIndicators, patternRepo, resultRepo, strategyRepo, BacktestResultRepository, PatternStatisticRepository (+1 more)

### Community 51 - "poll"
Cohesion: 0.12
Nodes (18): ajax(), batchSend(), cancelRefEvent(), cancelTimeout(), close(), closeAndRetry(), destroy(), ha (+10 more)

### Community 52 - "pw"
Cohesion: 0.11
Nodes (4): canPush(), leave(), leaveOpenTopic(), pw()

### Community 53 - ".closeTrade"
Cohesion: 0.19
Nodes (5): closeAllPaperPositions(), closePaperPosition(), getActivePaperPositions(), PaperTradingService, PositionManager

### Community 54 - "riskService.js"
Cohesion: 0.15
Nodes (6): BaseRiskModel, IndicatorConfluenceRiskModel, RiskRewardRiskModel, VolatilityDrawdownRiskModel, RiskService, calculatePositionSize()

### Community 56 - "Ka"
Cohesion: 0.12
Nodes (19): bl(), Cu(), dc(), Dg(), el(), Fg(), Iy(), Ka() (+11 more)

### Community 57 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, bcryptjs, class-variance-authority, clsx, cors, express, @hookform/resolvers, jsonwebtoken (+11 more)

### Community 58 - "decisionModels.js"
Cohesion: 0.16
Nodes (6): AggressiveDecisionModel, BaseDecisionModel, ConservativeDecisionModel, StandardDecisionModel, decideFinalRecommendation(), DecisionServiceOrchestrator

### Community 59 - "App.tsx"
Cohesion: 0.22
Nodes (14): react-router-dom, App(), AppContent(), AuthCardPage, GuestRoute(), LandingPage, OnboardingRoute(), OnboardingWizard (+6 more)

### Community 61 - "WatchlistRepository"
Cohesion: 0.16
Nodes (5): WatchlistController, WatchlistRepository, router, watchlistRepo, WatchlistService

### Community 62 - "nv"
Cohesion: 0.14
Nodes (15): ag(), contains(), Dl(), i0(), ih(), Ii(), e(), im() (+7 more)

### Community 63 - "constructor"
Cohesion: 0.17
Nodes (13): clone(), constructor(), _initRealtimeClient(), _initSupabaseAuthClient(), inPendingSyncState(), Kb(), Me(), normalizeEndpoint() (+5 more)

### Community 64 - "fw"
Cohesion: 0.23
Nodes (3): fw, hb(), push()

### Community 65 - "io"
Cohesion: 0.21
Nodes (6): Gi(), io(), ji, nf(), nw(), rw()

### Community 67 - "validator.js"
Cohesion: 0.22
Nodes (7): validateBody(), validateUUID(), validateSignIn, validateSignUp, validateCreateOrder, validateAddAsset, validateUpdateSettings

### Community 69 - "connectWithFallback"
Cohesion: 0.18
Nodes (8): connect(), connectWithFallback(), r0(), remove(), replaceTransport(), storeSession(), transportConnect(), transportName()

### Community 70 - "momentumEngine.js"
Cohesion: 0.23
Nodes (5): calculateMACD(), MomentumEngine, calculateEMA(), TrendEngine, calculateSMA()

### Community 73 - "._callRefreshToken"
Cohesion: 0.31
Nodes (4): cs(), ff(), sr(), Zl()

### Community 74 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, agentation, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+3 more)

### Community 80 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict, tsBuildInfoFile (+1 more)

### Community 82 - "PositionService.js"
Cohesion: 0.22
Nodes (4): PositionRepository, auditRepo, positionRepo, PositionService

### Community 83 - "decisionService.js"
Cohesion: 0.28
Nodes (5): DecisionService, ReasoningEngine, evaluateRisk(), ScoringEngine, TradePlanningService

### Community 84 - "mathUtils.js"
Cohesion: 0.33
Nodes (4): VolatilityAnalyzer, calculateAnnualizedVolatility(), calculateDailyReturns(), calculateStandardDeviation()

### Community 85 - "app.js"
Cohesion: 0.32
Nodes (3): resetHeadlineRotation(), startHeadlineRotation(), switchHeadline()

### Community 88 - "reasoningGenerator.js"
Cohesion: 0.46
Nodes (7): buildMomentumBlock(), buildRiskBlock(), buildSignalBlock(), buildStructureBlock(), buildTrendBlock(), buildVolumeBlock(), generateReasoning()

### Community 91 - "opportunityEngine.js"
Cohesion: 0.43
Nodes (4): ASSET_METADATA, initializeDatabase(), runOpportunityEngine(), test()

### Community 97 - ".decode"
Cohesion: 0.47
Nodes (5): binaryDecode(), decode(), decodeBroadcast(), decodePush(), decodeReply()

### Community 99 - "tradePlanGenerator.js"
Cohesion: 0.60
Nodes (5): calcRR(), classifyDuration(), classifyTradeQuality(), generateTradePlan(), round2()

### Community 104 - "src/middleware/auth.js"
Cohesion: 0.67
Nodes (3): JWT_SECRET, verifyToken(), getUser()

## Knowledge Gaps
- **10 isolated node(s):** `autoprefixer`, `class-variance-authority`, `clsx`, `postcss`, `tailwind-merge` (+5 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 851 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `$_` connect `$_` to `r`, `join`, `e`, `.toString`, `tv`, `Cn`, `.includes`, `.push`, `Ea`, `Kw`, `Rt`, `pn`, `then`, `Ci`, `Q`, `mw`, `._getOrReturnCtx`, `Ar`, `._debug`, `onConnMessage`, `hr`, `Be`, `._notifyAllSubscribers`, `Je`, `poll`, `pw`, `.add`, `Ka`, `nv`, `constructor`, `fw`, `io`, `connectWithFallback`, `._callRefreshToken`, `Zs`, `Ax`, `.decode`, `.dirty`, `aw`, `bu`, `ep`, `np`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `$_` (e.g. with `Cg()` and `Dg()`) actually correct?**
  _`$_` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `autoprefixer`, `class-variance-authority`, `clsx` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `$_` be split into smaller, more focused modules?**
  _Cohesion score 0.01226697575581957 - nodes in this community are weakly interconnected._
- **Why does `express` connect `backend/index.js` to `ApiError`, `NewsService.js`, `server.js`, `WatchlistRepository`, `UserService.js`, `package.json`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `e()` (e.g. with `ah()` and `am()`) actually correct?**
  _`e()` has 24 INFERRED edges - model-reasoned connections that need verification._
- **Should `BaseRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.035982008995502246 - nodes in this community are weakly interconnected._