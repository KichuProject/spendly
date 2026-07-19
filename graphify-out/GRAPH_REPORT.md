# Graph Report - E:\reactnative\spend  (2026-07-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2800 nodes · 7385 edges · 145 communities (102 shown, 43 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 899 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f90d381c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index-9a20d8fa637fbc5ba1eeb48bf225d5a1.js
- s
- l
- theme.js
- v
- HomeScreen.jsx
- f
- expenseController.js
- authService.js
- ci
- n
- APIClient
- d
- o
- u
- c
- notificationService.js
- dependencies
- push
- t
- App.js
- notificationJobs.js
- e
- User.js
- voiceController.js
- dateUtils.js
- cc
- r
- expo
- cronJobs.js
- target-appmodules-RelWithDebInfo-64b2a1c292ab109790a5.json
- target-appmodules-RelWithDebInfo-1845c050cccaedf1e6f8.json
- target-appmodules-RelWithDebInfo-6ec6a861f8a3e8a234c1.json
- target-appmodules-RelWithDebInfo-27319b785f3af9a7ef25.json
- target-appmodules-Debug-c8f01a9ee735f2174ac6.json
- $
- logger.js
- h
- p
- analyticsController.js
- getDelayFunction
- .fail
- categoryUtils.js
- .sendEvent
- us
- .createInstance
- a
- bo
- delete
- ic
- .reset
- __getNativeTag
- friendController.js
- get
- .__getValue
- AIChatScreen.jsx
- .add
- .constructor
- dependencies
- useFriendsStore.js
- setState
- start
- scripts
- clear
- platformUtils.js
- package.json
- _genPromise
- MainActivity
- versionController.js
- MainApplication
- ensureConfig
- .addEventListener
- .componentWillUnmount
- .getState
- .onSuccessfulTap
- manageStateFrameCallback
- build-merge.js
- foo
- foo
- foo
- foo
- foo
- gradlew
- syncPropsBackToReact
- .componentDidUpdate
- env.js
- .setDynamicFeatureFlag
- expo-blur
- expo-constants
- expo-font
- expo-gl
- @expo-google-fonts/inter
- expo-haptics
- expo-linear-gradient
- expo-notifications
- expo-speech-recognition
- expo-status-bar
- @expo/vector-icons
- react-dom
- @react-native-async-storage/async-storage
- react-native-chart-kit
- react-native-gesture-handler
- react-native-reanimated
- react-native-safe-area-context
- react-native-svg
- react-native-worklets
- @react-navigation/bottom-tabs
- @react-navigation/native
- three
- zustand
- xu

## God Nodes (most connected - your core abstractions)
1. `n()` - 263 edges
2. `o()` - 245 edges
3. `t()` - 234 edges
4. `c()` - 213 edges
5. `l()` - 204 edges
6. `s()` - 192 edges
7. `u()` - 170 edges
8. `e()` - 157 edges
9. `v()` - 142 edges
10. `h()` - 141 edges

## Surprising Connections (you probably didn't know these)
- `OTPInput()` --indirect_call--> `i()`  [INFERRED]
  frontend/app/components/OTPInput.jsx → backend/public/_expo/static/js/web/index-9a20d8fa637fbc5ba1eeb48bf225d5a1.js
- `DateRangePicker()` --indirect_call--> `d()`  [INFERRED]
  frontend/app/components/DateRangePicker.jsx → backend/public/_expo/static/js/web/index-9a20d8fa637fbc5ba1eeb48bf225d5a1.js
- `HomeScreen()` --indirect_call--> `d()`  [INFERRED]
  frontend/app/screens/HomeScreen.jsx → backend/public/_expo/static/js/web/index-9a20d8fa637fbc5ba1eeb48bf225d5a1.js
- `NotificationsScreen()` --indirect_call--> `d()`  [INFERRED]
  frontend/app/screens/NotificationsScreen.jsx → backend/public/_expo/static/js/web/index-9a20d8fa637fbc5ba1eeb48bf225d5a1.js
- `StatsScreen()` --indirect_call--> `d()`  [INFERRED]
  frontend/app/screens/StatsScreen.jsx → backend/public/_expo/static/js/web/index-9a20d8fa637fbc5ba1eeb48bf225d5a1.js

## Import Cycles
- None detected.

## Communities (145 total, 43 thin omitted)

### Community 0 - "index-9a20d8fa637fbc5ba1eeb48bf225d5a1.js"
Cohesion: 0.01
Nodes (104): alpha(), an(), applyWithGuard(), blur(), blurTextInput(), callLogout(), cancelPendingGestures(), Cd() (+96 more)

### Community 2 - "l"
Cohesion: 0.04
Nodes (7): duration(), getInitialURL(), getLoadedFonts(), l(), reduceMotion(), returnValue(), withCallback()

### Community 3 - "theme.js"
Cohesion: 0.10
Nodes (34): styles, styles, styles, AutocompleteInput(), styles, styles, styles, styles (+26 more)

### Community 4 - "v"
Cohesion: 0.04
Nodes (6): currentlyFocusedField(), dismiss(), initialize(), measureLayout(), Sa(), v()

### Community 5 - "HomeScreen.jsx"
Cohesion: 0.10
Nodes (43): AddExpenseSheet(), AddFriendSheet(), AnimatedStreakFlame(), styles, CategoryIcon(), EditFriendSheet(), EmptyState(), styles (+35 more)

### Community 6 - "f"
Cohesion: 0.05
Nodes (11): constructor(), f(), getSize(), getStateForAction(), insert(), ls(), measureInWindow(), queryCache() (+3 more)

### Community 7 - "expenseController.js"
Cohesion: 0.08
Nodes (44): getCategoryBreakdown(), DayCompletion, Expense, getDayCompletions(), getDayStatus(), getIncompleteDays(), initializeDays(), logger (+36 more)

### Community 8 - "authService.js"
Cohesion: 0.07
Nodes (45): handleForgotPassword(), handleLogin(), handleLogout(), handleRefreshToken(), handleResendOTP(), handleResetPassword(), handleSendOTP(), handleVerifyOTP() (+37 more)

### Community 9 - "ci"
Cohesion: 0.07
Nodes (50): Ad(), bc(), ci(), co(), di(), ed(), ei(), el() (+42 more)

### Community 10 - "n"
Cohesion: 0.04
Nodes (7): backIndex(), lastUnhandledLink(), measure(), n(), nl(), reportFatalError(), setLastUnhandledLink()

### Community 12 - "d"
Cohesion: 0.11
Nodes (29): ae(), B(), Be(), bi(), ce, d(), dp(), ee() (+21 more)

### Community 13 - "o"
Cohesion: 0.04
Nodes (15): assert(), bubbles(), cancelable(), cancelBubble(), composed(), currentTarget(), defaultPrevented(), deviceName() (+7 more)

### Community 14 - "u"
Cohesion: 0.05
Nodes (4): composedPath(), register(), u(), unregister()

### Community 15 - "c"
Cohesion: 0.06
Nodes (4): c(), id(), registerFrameCallback(), rs()

### Community 16 - "notificationService.js"
Cohesion: 0.10
Nodes (26): handleChangePassword(), handleDisableNotifications(), handleDismissNotifications(), handleEnableNotifications(), handleGetProfile(), handleRegisterPushToken(), handleSendTestPush(), handleUpdateProfile() (+18 more)

### Community 17 - "dependencies"
Cohesion: 0.04
Nodes (48): axios, author, dependencies, axios, bcryptjs, cors, dotenv, helmet (+40 more)

### Community 18 - "push"
Cohesion: 0.08
Nodes (42): ar(), at(), br(), Bt(), ct(), dr(), En(), Et() (+34 more)

### Community 19 - "t"
Cohesion: 0.05
Nodes (17): attachGestureHandler(), configureNextLayoutAnimation(), createGestureHandler(), init(), t(), To(), touchableHandleActivePressIn(), touchableHandleActivePressOut() (+9 more)

### Community 20 - "App.js"
Cohesion: 0.06
Nodes (36): App(), ChangePasswordModal(), ConfirmModal(), EditProfileModal(), NavBar(), styles, TABS, styles (+28 more)

### Community 21 - "notificationJobs.js"
Cohesion: 0.10
Nodes (17): DayCompletion, dayCompletionSchema, mongoose, mongoose, NotificationLog, notificationLogSchema, cron, DayCompletion (+9 more)

### Community 22 - "e"
Cohesion: 0.07
Nodes (6): e(), getIsInitial(), getKey(), getState(), ru(), setKey()

### Community 23 - "User.js"
Cohesion: 0.06
Nodes (34): Expense, expenseSchema, mongoose, splitSchema, Friend, friendSchema, mongoose, { hashString, compareHash, encryptPassword, decryptPassword } (+26 more)

### Community 24 - "voiceController.js"
Cohesion: 0.07
Nodes (31): cancelConversation(), chatTransaction(), { chatWithNvidia }, confirmTransactions(), conversationManager, { getStartOfDay, addDays, toDateKey }, logger, { validateTransactions } (+23 more)

### Community 25 - "dateUtils.js"
Cohesion: 0.13
Nodes (35): DateRangePicker(), DayCard(), styles, chartConfig, StatsScreen(), styles, TIMEFRAMES, normalizeExpense() (+27 more)

### Community 26 - "cc"
Cohesion: 0.07
Nodes (49): Al(), bu(), cc(), dc(), De(), Ec(), ef(), fa() (+41 more)

### Community 27 - "r"
Cohesion: 0.09
Nodes (6): i(), Ie(), mi(), r(), replace(), unloadAsync()

### Community 28 - "expo"
Cohesion: 0.05
Nodes (36): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, googleServicesFile, ndkVersion, package (+28 more)

### Community 29 - "cronJobs.js"
Cohesion: 0.08
Nodes (32): app, { connectDB }, handleGracefulShutdown(), { initializeAllJobs, stopAllJobs }, logger, mongoose, startServer(), connectDB() (+24 more)

### Community 30 - "target-appmodules-RelWithDebInfo-64b2a1c292ab109790a5.json"
Cohesion: 0.06
Nodes (34): artifacts, backtrace, backtraceGraph, commands, files, nodes, compileGroups, dependencies (+26 more)

### Community 31 - "target-appmodules-RelWithDebInfo-1845c050cccaedf1e6f8.json"
Cohesion: 0.06
Nodes (34): artifacts, backtrace, backtraceGraph, commands, files, nodes, compileGroups, dependencies (+26 more)

### Community 32 - "target-appmodules-RelWithDebInfo-6ec6a861f8a3e8a234c1.json"
Cohesion: 0.06
Nodes (34): artifacts, backtrace, backtraceGraph, commands, files, nodes, compileGroups, dependencies (+26 more)

### Community 33 - "target-appmodules-RelWithDebInfo-27319b785f3af9a7ef25.json"
Cohesion: 0.06
Nodes (34): artifacts, backtrace, backtraceGraph, commands, files, nodes, compileGroups, dependencies (+26 more)

### Community 34 - "target-appmodules-Debug-c8f01a9ee735f2174ac6.json"
Cohesion: 0.06
Nodes (33): artifacts, backtrace, backtraceGraph, commands, files, nodes, compileGroups, dependencies (+25 more)

### Community 35 - "$"
Cohesion: 0.07
Nodes (11): addListener(), current(), __getNativeAnimationConfig(), __getNativeConfig(), __getValue(), hasListeners(), __makeNative(), removeAllListeners() (+3 more)

### Community 36 - "logger.js"
Cohesion: 0.07
Nodes (28): analyticsRoutes, app, authRoutes, cors, dayRoutes, errorHandler, expenseRoutes, express (+20 more)

### Community 37 - "h"
Cohesion: 0.09
Nodes (3): delay(), h(), x()

### Community 38 - "p"
Cohesion: 0.10
Nodes (12): _dispatchEvent(), Ff(), g(), getInitialState(), getRehydratedState(), getStateForRouteFocus(), getStateForRouteNamesChange(), openURL() (+4 more)

### Community 39 - "analyticsController.js"
Cohesion: 0.10
Nodes (23): express, Expense, Friend, getFriendBalance(), getSpendingTrends(), getTopExpenses(), getTotalBalance(), logger (+15 more)

### Community 44 - "categoryUtils.js"
Cohesion: 0.15
Nodes (16): keyword(), AddExpenseSheetFriends(), BASELINE_DATE, buildExpense(), getSeedData(), makeId(), rawExpenses, SEED_FRIENDS (+8 more)

### Community 45 - ".sendEvent"
Cohesion: 0.20
Nodes (4): cancelEvent(), forceInvalidate(), onGestureActivated(), setupEvents()

### Community 46 - "us"
Cohesion: 0.12
Nodes (20): as(), bp(), cs(), dd(), ds(), es(), fs(), is() (+12 more)

### Community 48 - "a"
Cohesion: 0.13
Nodes (20): a(), ai(), bd(), gd(), gf(), kd(), ki(), Kl() (+12 more)

### Community 49 - "bo"
Cohesion: 0.08
Nodes (30): Ao(), ba(), bo(), da(), Do(), du(), Eo(), eu() (+22 more)

### Community 50 - "delete"
Cohesion: 0.07
Nodes (32): bf(), bn(), Cl(), cp(), delete(), ep(), fp(), gp() (+24 more)

### Community 51 - "ic"
Cohesion: 0.16
Nodes (17): Ac(), af(), cu(), ea(), fu(), gs(), hs(), ic() (+9 more)

### Community 57 - "friendController.js"
Cohesion: 0.17
Nodes (16): createFriend(), deleteFriend(), Expense, Friend, FRIEND_GRADIENTS, getFriend(), getFriendBalance(), getFriends() (+8 more)

### Community 58 - "get"
Cohesion: 0.13
Nodes (5): addEventListener(), controlledBottomTabs(), get(), synchronousHeaderConfigUpdatesEnabled(), synchronousHeaderSubviewUpdatesEnabled()

### Community 60 - ".__getValue"
Cohesion: 0.14
Nodes (6): flush(), __getAnimatedValue(), __getChildren(), __onAnimatedValueUpdateReceived(), toJSON(), update()

### Community 61 - "AIChatScreen.jsx"
Cohesion: 0.18
Nodes (10): BottomAssistant(), ConfirmationCard(), styles, TRANSACTION_THEMES, MessageBubble(), styles, AIChatScreen(), styles (+2 more)

### Community 62 - ".add"
Cohesion: 0.20
Nodes (3): add(), clearInteractionHandle(), createInteractionHandle()

### Community 63 - ".constructor"
Cohesion: 0.15
Nodes (4): __addChild(), __getPlatformConfig(), registerForEvents(), unregisterFromEvents()

### Community 65 - "dependencies"
Cohesion: 0.15
Nodes (13): expo, dependencies, expo, react-native, react-native-screens, react-native-web, @react-navigation/stack, uuid (+5 more)

### Community 66 - "useFriendsStore.js"
Cohesion: 0.23
Nodes (9): FriendCard(), styles, SplitPersonRow(), styles, FRIEND_GRADIENTS, getInitials(), normalizeFriend(), normalizeFriends() (+1 more)

### Community 68 - "start"
Cohesion: 0.20
Nodes (7): computeViewableItems(), __debouncedOnEnd(), onUpdate(), _onUpdateSync(), start(), __startNativeAnimation(), stop()

### Community 69 - "scripts"
Cohesion: 0.17
Nodes (11): description, name, private, scripts, build, build:frontend, dev:backend, dev:frontend (+3 more)

### Community 70 - "clear"
Cohesion: 0.20
Nodes (3): clear(), removeListeners(), resetServerContext()

### Community 71 - "platformUtils.js"
Cohesion: 0.31
Nodes (8): getFlexibleContainerStyle(), getMaxWidth(), getModalOverlayStyle(), getWebContainerStyle(), isAndroid(), isIOS(), isWeb(), selectPlatform()

### Community 72 - "package.json"
Cohesion: 0.18
Nodes (10): main, name, private, scripts, android, build, ios, start (+2 more)

### Community 74 - "_genPromise"
Cohesion: 0.22
Nodes (10): cancelTasks(), catch(), enqueue(), enqueueTasks(), _genPromise(), _getCurrentQueue(), hasTasksToProcess(), processNext() (+2 more)

### Community 76 - "MainActivity"
Cohesion: 0.20
Nodes (5): Bundle, MainActivity, ReactActivity, ReactActivityDelegate, String

### Community 78 - "versionController.js"
Cohesion: 0.22
Nodes (5): AppVersion, logger, AppVersion, appVersionSchema, mongoose

### Community 79 - "MainApplication"
Cohesion: 0.25
Nodes (5): Application, Configuration, MainApplication, ReactApplication, ReactHost

### Community 82 - "ensureConfig"
Cohesion: 0.18
Nodes (5): addPendingGesture(), ensureConfig(), setView(), shouldUseTouchEvents(), updateGestureConfig()

### Community 83 - ".addEventListener"
Cohesion: 0.43
Nodes (5): go(), kp(), listen(), rd(), removeEventListener()

### Community 88 - "manageStateFrameCallback"
Cohesion: 0.40
Nodes (3): manageStateFrameCallback(), runCallbacks(), unregisterFrameCallback()

### Community 90 - "build-merge.js"
Cohesion: 0.40
Nodes (4): backendPublic, frontendDist, fs, path

### Community 99 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 144 - "xu"
Cohesion: 0.25
Nodes (9): aa(), la(), Ma(), qa(), Qr(), Ua(), wa(), xu() (+1 more)

## Knowledge Gaps
- **500 isolated node(s):** `name`, `version`, `description`, `main`, `start` (+495 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `t` to `index-9a20d8fa637fbc5ba1eeb48bf225d5a1.js`, `s`, `l`, `theme.js`, `v`, `f`, `ci`, `n`, `d`, `o`, `u`, `c`, `notificationService.js`, `push`, `App.js`, `e`, `cc`, `r`, `$`, `h`, `p`, `getDelayFunction`, `.sendEvent`, `.createInstance`, `a`, `bo`, `delete`, `.onHandlerStateChange`, `__getNativeTag`, `.constructor`, `get`, `._handleAnimatedStylesUpdate`, `.__getValue`, `.add`, `.constructor`, `setState`, `start`, `clear`, `_genPromise`, `._createEventHandlers`, `.setValue`, `.addToTracker`, `ensureConfig`, `.addEventListener`, `.getRow`?**
  _High betweenness centrality (0.209) - this node is a cross-community bridge._
- **Why does `sendBatchNotifications()` connect `notificationService.js` to `t`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **Why does `e()` connect `e` to `index-9a20d8fa637fbc5ba1eeb48bf225d5a1.js`, `s`, `l`, `theme.js`, `v`, `HomeScreen.jsx`, `f`, `ci`, `n`, `d`, `o`, `u`, `c`, `push`, `t`, `App.js`, `dateUtils.js`, `r`, `$`, `h`, `p`, `.updateLastCoords`, `.fail`, `.tryToSendTouchEvent`, `a`, `bo`, `delete`, `.reset`, `.dispatchEvent`, `.constructor`, `.__getValue`, `AIChatScreen.jsx`, `.add`, `.constructor`, `setState`, `start`, `.setValue`, `.tryEndFling`, `.addEventListener`, `.onPointerMoveOver`, `.onSuccessfulTap`, `.constructor`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Are the 62 inferred relationships involving `n()` (e.g. with `a()` and `bp()`) actually correct?**
  _`n()` has 62 INFERRED edges - model-reasoned connections that need verification._
- **Are the 49 inferred relationships involving `o()` (e.g. with `ai()` and `cu()`) actually correct?**
  _`o()` has 49 INFERRED edges - model-reasoned connections that need verification._
- **Are the 90 inferred relationships involving `t()` (e.g. with `addListener()` and `.__attach()`) actually correct?**
  _`t()` has 90 INFERRED edges - model-reasoned connections that need verification._
- **Are the 37 inferred relationships involving `c()` (e.g. with `a()` and `ai()`) actually correct?**
  _`c()` has 37 INFERRED edges - model-reasoned connections that need verification._