# Exam AI Malawi - ChatGPT-Style Refactoring Plan

## 🎯 Objective
Transform existing system into ChatGPT-like AI education assistant with intelligent cost-saving backend, RAG + cache hybrid intelligence, smooth streaming typing UI, and offline-first chat experience.

## 📊 Current Architecture Analysis

### ✅ Existing Working Features
- **Backend (FastAPI):**
  - Gemini AI integration (gemini-2.5-flash-lite)
  - Basic RAG system (token-based search in knowledge_base.py)
  - User limits & payment system (PayChangu)
  - Document upload & processing
  - Admin training API
  - Student performance tracking

- **Frontend (React):**
  - Basic chat UI (AIAssistant.js)
  - User limits context (3 questions/day free, 1 after 5 days)
  - Auth context
  - Payment modal component
  - Voice input feature

### ❌ Missing Components
- **Backend:**
  - Cache layer (no caching at all)
  - Vector-based semantic search (only token-based)
  - AI fallback layer (only Gemini)
  - Smart routing logic
  - Learning memory system
  - Streaming responses (SSE/WebSocket)
  - Enhanced rate limiting (per-minute, IP-based)

- **Frontend:**
  - ChatGPT-style UI (bubbles, dark/light mode)
  - Streaming typing animation
  - Offline-first storage (IndexedDB)
  - Mobile responsive layout

## 🚀 Implementation Phases

### Phase 1: Cache Layer (Priority 1) - Backend
**Goal:** Eliminate 50-80% of repeated API calls

**Implementation:**
1. Add Redis or simple JSON-file-based cache
2. Implement question hash matching (SHA-256)
3. Cache structure: `{hash: {question, answer, embedding, timestamp}}`
4. Cache lookup before any AI/RAG call
5. Cache TTL: 24 hours for educational content

**Files to modify:**
- `backend/cache_layer.py` (NEW)
- `backend/app.py` (integrate cache into chat endpoint)
- `backend/requirements.txt` (add redis if using Redis)

**Zero regression:** Cache miss falls through to existing logic

### Phase 2: Enhanced RAG Layer (Priority 1) - Backend
**Goal:** Improve semantic search with vector embeddings

**Implementation:**
1. Add pgvector or sentence-transformers for embeddings
2. Enhance existing knowledge_base.py with vector search
3. Add confidence threshold (>0.85 returns answer directly)
4. Keep token-based search as fallback
5. Store: syllabus, notes, FAQs, past questions

**Files to modify:**
- `backend/knowledge_base.py` (add vector search)
- `backend/app.py` (use enhanced RAG)
- `backend/requirements.txt` (add sentence-transformers or pgvector)

**Zero regression:** Vector search failure falls back to existing token search

### Phase 3: AI Fallback Layer (Priority 1) - Backend
**Goal:** Add multiple AI providers for reliability

**Implementation:**
1. Add Groq as primary (faster, cheaper)
2. Add OpenRouter as backup
3. Keep Gemini as fallback
4. Implement provider switching logic
5. Add health checks for each provider

**Files to modify:**
- `backend/ai_providers.py` (NEW)
- `backend/app.py` (integrate provider switching)
- `backend/requirements.txt` (add groq, openrouter SDKs)

**Zero regression:** All providers fall back to existing Gemini

### Phase 4: Smart Routing Logic (Priority 1) - Backend
**Goal:** Implement intelligent request routing

**Flow:**
```
Request → Rate Limit Check → Exact Cache Lookup → Semantic Cache Match → 
Vector DB Retrieval (RAG) → Strong Context? → Answer from RAG → 
Else → AI API Call → Store in Cache + Vector DB + Learning System
```

**Files to modify:**
- `backend/smart_router.py` (NEW)
- `backend/app.py` (replace main chat handler with router)

**Zero regression:** Router failure falls back to existing chat endpoint

### Phase 5: Learning Memory System (Priority 2) - Backend
**Goal:** Track per-user learning patterns

**Implementation:**
1. Track weak topics per user
2. Track repeated mistakes
3. Track frequent subjects
4. Trigger: "If user struggles with X → suggest practice questions"
5. Store in JSON file or database

**Files to modify:**
- `backend/learning_memory.py` (NEW)
- `backend/app.py` (integrate learning tracking)
- `backend/student_performance.py` (enhance existing)

**Zero regression:** Learning system is additive, doesn't block requests

### Phase 6: Enhanced Rate Limiting (Priority 2) - Backend
**Goal:** Add per-minute throttling and IP protection

**Implementation:**
1. Extend existing rate limiting
2. Add per-minute limits (e.g., 10 requests/minute)
3. Add optional IP-based protection
4. Implement sliding window algorithm

**Files to modify:**
- `backend/rate_limiter.py` (NEW)
- `backend/app.py` (integrate enhanced rate limiting)

**Zero regression:** Enhanced limits are additive to existing daily limits

### Phase 7: Database Extensions (Priority 2) - Backend
**Goal:** Add learning_data and usage_logs tables

**Implementation:**
1. Add learning_data table (weak topics, mistakes, subjects)
2. Add usage_logs table (if missing)
3. Add optional embedding field in cache
4. Use existing JSON storage or add SQLite

**Files to modify:**
- `backend/database.py` (NEW or enhance existing)
- `backend/app.py` (use new tables)

**Zero regression:** Database is optional, falls back to JSON files

### Phase 8: ChatGPT-Style UI (Priority 1) - Frontend
**Goal:** Modern chat interface

**Implementation:**
1. Clean minimal chat interface
2. Smooth message bubbles (user vs assistant)
3. Dark mode + light mode support
4. Typing indicator ("AI is thinking…" dots animation)
5. Auto-scroll to latest message
6. Mobile responsive layout

**Files to modify:**
- `src/components/AIAssistant.js` (major UI overhaul)
- `src/components/ChatMessage.js` (NEW component)
- `src/components/TypingIndicator.js` (NEW component)
- `src/styles/chat.css` (NEW or enhance existing)

**Zero regression:** Keep all existing functionality, just improve UI

### Phase 9: Streaming Response UI (Priority 1) - Frontend + Backend
**Goal:** Simulate ChatGPT-style typing effect

**Backend Implementation:**
1. Add SSE (Server-Sent Events) or WebSocket support
2. Stream responses token-by-token
3. Implement chunked response generation

**Frontend Implementation:**
1. Progressive streaming effect
2. Smooth character-by-character rendering
3. Slight delay per chunk for natural feel
4. Optional "fading text reveal" animation

**Files to modify:**
- `backend/app.py` (add SSE endpoint)
- `src/services/aiService.js` (handle streaming)
- `src/components/AIAssistant.js` (streaming UI)

**Zero regression:** Non-streaming fallback for compatibility

### Phase 10: Offline-First Chat Storage (Priority 1) - Frontend
**Goal:** Chat must be usable offline

**Implementation:**
1. Use IndexedDB for local storage
2. Store messages, timestamps, chat sessions
3. Offline mode indicator
4. Sync local chats to server when back online
5. Conflict resolution for concurrent edits

**Files to modify:**
- `src/services/offlineStorage.js` (NEW IndexedDB wrapper)
- `src/components/AIAssistant.js` (integrate offline storage)
- `src/services/aiService.js` (sync logic)

**Zero regression:** Offline storage is additive, doesn't affect online mode

### Phase 11: Testing & Validation (Priority 1)
**Goal:** Ensure zero regression

**Testing Checklist:**
- [ ] All existing features still work
- [ ] Cache layer reduces API calls by 50-80%
- [ ] RAG improvements don't break existing search
- [ ] AI fallback layer works correctly
- [ ] Smart routing doesn't cause delays
- [ ] Learning system doesn't interfere with requests
- [ ] Rate limiting doesn't block legitimate users
- [ ] Chat UI maintains all existing functionality
- [ ] Streaming works with fallback to non-streaming
- [ ] Offline storage syncs correctly
- [ ] Performance improvements measurable

## 📦 Output Requirements

### Backend Changes Only
- Cache layer implementation
- Enhanced RAG with vector search
- AI fallback layer
- Smart routing logic
- Learning memory system
- Enhanced rate limiting
- Database extensions
- Streaming support (SSE)

### Frontend Changes
- ChatGPT-style UI components
- Streaming animation
- Offline storage implementation

### Migration Scripts
- Cache migration (if needed)
- Database schema updates
- Data migration from JSON to DB (if using DB)

### Documentation
- Architecture diagram
- API documentation updates
- Deployment guide
- Troubleshooting guide

## 🚫 Constraints
- No full frontend rewrite
- No API breaking changes
- Preserve auth + user data
- Keep system modular + reversible
- Zero regression guaranteed

## 📈 Success Metrics
- 50-80% fewer AI API calls
- Instant cached responses
- Smooth streaming UX
- Zero downtime behavior
- Works offline for chat history
- All existing features preserved
