# 🧪 Testing Guide: Optimistic UI Message Display

## Quick Start Test (2 minutes)

### Test 1: Basic Message Display
```
1. Open app and login
2. Click on a project
3. Click "New Conversation"
4. Type: "Hello"
5. Click Send
6. Expected: Message appears IMMEDIATELY (< 100ms)
7. ✅ Pass if message is visible before input clears
```

### Test 2: Message Persists
```
1. Send a message (should appear instantly)
2. Refresh the page (F5)
3. Navigate back to chat
4. Expected: Message still visible
5. ✅ Pass if message survived refresh
```

### Test 3: Error Handling
```
1. Open DevTools (F12) → Network tab
2. Set Network throttling to "Offline"
3. Send a message
4. Expected: Message appears optimistically
5. Wait 3 seconds
6. Expected: Error toast appears, message removed
7. Set Network back to "Online"
8. Send message again
9. ✅ Pass if message works and no duplicate exists
```

---

## Detailed Test Cases

### FEATURE: Optimistic UI Update

#### Test Case 1.1: Single Message Display
**Objective**: Verify user message appears instantly

**Steps**:
1. Login and open project chat
2. Ensure chat is empty (or new conversation)
3. Type: "Test message 123"
4. **At T=0ms**: Click Send button
5. **At T<100ms**: Observe chat area
6. **At T=500ms**: Wait for assistant response

**Expected Results**:
- ✅ Message appears immediately (T < 100ms)
- ✅ Message has user avatar (right side, blue background)
- ✅ Message text matches input: "Test message 123"
- ✅ Message shows timestamp
- ✅ Input field is cleared
- ✅ Assistant response appears later (T=500-2000ms)

**Pass Criteria**: Message visible BEFORE assistant response arrives

---

#### Test Case 1.2: Multiple Rapid Messages
**Objective**: Verify multiple messages don't collide

**Steps**:
1. Open chat (empty conversation)
2. Send 5 messages rapidly (< 1 second each):
   - "Message 1"
   - "Message 2"
   - "Message 3"
   - "Message 4"
   - "Message 5"
3. Observe chat as messages are sent

**Expected Results**:
- ✅ All 5 messages appear immediately
- ✅ Messages appear in correct order (1, 2, 3, 4, 5)
- ✅ No duplicate messages
- ✅ No skipped messages
- ✅ Each message has unique ID
- ✅ Each message can have different response times

**Pass Criteria**: All messages visible, correct order, no duplicates

---

#### Test Case 1.3: Message Format Verification
**Objective**: Verify message structure

**Steps**:
1. Send: "Hello world!"
2. Open DevTools → Console
3. Run:
```javascript
const { useProjectsStore } = await import('/src/store/projectsStore.ts');
const store = useProjectsStore();
const msg = store.currentConversation?.messages?.[0];
console.log('Message:', msg);
console.log('ID:', msg?.id);
console.log('Role:', msg?.role);
console.log('Content:', msg?.content);
console.log('Is Temp?:', msg?.id?.startsWith('temp-'));
```

**Expected Results**:
- ✅ `role` = "user"
- ✅ `content` = "Hello world!"
- ✅ `id` starts with "temp-" (before API response)
- ✅ `createdAt` is a valid date
- ✅ After 1-2 seconds, `id` changes to real UUID

**Pass Criteria**: Message structure correct and ID transitions from temp to real

---

#### Test Case 2.1: Error Recovery - Network Failure
**Objective**: Verify rollback on error

**Steps**:
1. Open DevTools (F12)
2. Go to Network tab
3. Throttle connection: "Offline"
4. Send message: "Test error"
5. Wait 5 seconds (timeout)
6. Observe chat
7. Note: Error should appear in toast

**Expected Results**:
- ✅ Message appears optimistically
- ✅ After timeout, error toast shows
- ✅ Message is removed from chat (rollback)
- ✅ Chat returns to empty state
- ✅ No orphaned temp messages

**Pass Criteria**: Message removed after error, clean state

---

#### Test Case 2.2: Error Recovery - Invalid Response
**Objective**: Verify handling of bad API responses

**Steps**:
1. Open Network tab in DevTools
2. Send a message
3. Intercept response and break it (modify response)
4. Observe chat

**Expected Results**:
- ✅ Message appears optimistically
- ✅ Error is caught when processing response
- ✅ Temp message is rolled back
- ✅ Error message shown to user

**Pass Criteria**: Graceful error handling with rollback

---

#### Test Case 2.3: Conversation State Sync
**Objective**: Verify sidebar and chat area stay in sync

**Steps**:
1. Open project with multiple conversations
2. Select conversation A (shows in chat area)
3. Send message in conversation A
4. Observe both:
   - Chat area (right side)
   - Conversation list (left sidebar)
5. Switch to conversation B
6. Switch back to conversation A

**Expected Results**:
- ✅ Message appears in chat area
- ✅ Conversation A updated time in sidebar
- ✅ Message count reflects in sidebar
- ✅ After switching, message still visible
- ✅ No desync between sidebar and chat

**Pass Criteria**: Message visible in both sidebar and chat area

---

#### Test Case 3.1: Message Persistence - localStorage
**Objective**: Verify message survives page refresh

**Steps**:
1. Send a message
2. Verify it appears
3. Press F5 (refresh)
4. Wait for page to reload
5. Navigate back to same project/conversation
6. Check if message is there

**Expected Results**:
- ✅ Message visible after refresh
- ✅ Message ID unchanged
- ✅ Message content preserved
- ✅ Message role (user/assistant) correct
- ✅ Message timestamp preserved

**Pass Criteria**: Message persisted in localStorage

---

#### Test Case 3.2: Clear Data - Fresh State
**Objective**: Verify clean state after data reset

**Steps**:
1. Send several messages
2. Open DevTools Console
3. Run:
```javascript
import { resetAppState } from '@/lib/appStateReset.ts';
resetAppState();
location.reload();
```
4. Check chat area

**Expected Results**:
- ✅ All messages cleared
- ✅ Chat is empty
- ✅ No orphaned temp messages
- ✅ App state is clean
- ✅ Logout/login works normally

**Pass Criteria**: Clean state achieved

---

### FEATURE: Temp ID Replacement

#### Test Case 4.1: Temp ID to Real ID Transition
**Objective**: Verify temp ID is replaced with real ID

**Steps**:
1. Send message: "Track my ID"
2. Open DevTools Console
3. Immediately (< 500ms) check:
```javascript
const msg = useProjectsStore().currentConversation?.messages?.[0];
console.log('Temp ID:', msg?.id);
```
4. Wait 1 second
5. Check again:
```javascript
const msg = useProjectsStore().currentConversation?.messages?.[0];
console.log('Real ID:', msg?.id);
```

**Expected Results**:
- ✅ First check shows: `temp-1737000000000` format
- ✅ Second check shows: Real UUID format (different)
- ✅ No flicker or jumping
- ✅ Message position unchanged

**Pass Criteria**: ID transitions smoothly from temp to real

---

### FEATURE: UI Responsiveness

#### Test Case 5.1: Perceived Latency
**Objective**: Measure user-perceived response time

**Steps**:
1. Open DevTools → Performance tab
2. Start recording
3. Send message
4. Stop recording
5. Check timeline

**Expected Results**:
- ✅ Message appears within 100ms
- ✅ No long tasks blocking UI
- ✅ Input responsive during send
- ✅ Chat scrolls smoothly

**Pass Criteria**: Message appears instantly (< 100ms)

---

#### Test Case 5.2: Streaming Response Handling
**Objective**: Verify assistant response streams properly

**Steps**:
1. Send message that triggers streaming
2. Observe chat area:
   - User message appears instantly
   - Assistant response appears gradually
   - Text appears word-by-word (if streaming)
3. Wait for complete response

**Expected Results**:
- ✅ User message appears first
- ✅ Assistant message arrives after user message
- ✅ Assistant response updates in real-time
- ✅ No message jumping or reordering
- ✅ Final message has real ID (not temp)

**Pass Criteria**: Streaming flows naturally after optimistic user message

---

## Browser DevTools Console Tests

### View Current Conversation State
```javascript
const store = useProjectsStore();
console.table(store.currentConversation?.messages);
```

### Check All Temp Messages
```javascript
const store = useProjectsStore();
const tempMsgs = store.currentConversation?.messages?.filter(m => m.id.startsWith('temp-'));
console.log('Temp messages:', tempMsgs.length);
tempMsgs.forEach(m => console.log(`  - ${m.role}: ${m.id}`));
```

### Monitor State Changes (Real-time)
```javascript
const store = useProjectsStore();
const unsubscribe = store.subscribe(
  (state) => console.log('State updated:', state.currentConversation?.messages?.length, 'messages')
);
// Send a message and watch console
// To stop: unsubscribe()
```

### Check Message IDs
```javascript
const store = useProjectsStore();
store.currentConversation?.messages?.forEach((m, i) => {
  console.log(`[${i}] ${m.role.toUpperCase()}: ${m.id.substring(0, 20)}...`);
});
```

---

## Performance Metrics

### Target Metrics
| Metric | Target | Acceptable |
|--------|--------|-----------|
| Optimistic render latency | < 50ms | < 100ms |
| Temp ID generation | < 1ms | < 5ms |
| State update time | < 10ms | < 50ms |
| API response handling | < 200ms | < 500ms |
| Message rollback time | < 50ms | < 100ms |

### Measuring (Chrome DevTools)
1. Open DevTools → Performance tab
2. Start recording
3. Send message
4. Stop recording
5. Inspect timeline for:
   - First message render
   - API request initiation
   - Response handling
   - ID replacement

---

## Common Issues & Debugging

### Issue: Message doesn't appear immediately
```
Diagnosis:
1. Check if optimistic message is being created
2. Check console for: "Optimistic update - adding user message"
3. Check state: useProjectsStore().currentConversation?.messages

Solution:
1. Check projectsStore.ts sendMessage function
2. Verify set() is being called before API
3. Check conversation ID is valid (not temp)
```

### Issue: Temp message not replaced
```
Diagnosis:
1. Check console for: "Temporary ID replaced with real IDs"
2. Check if API response has correct structure
3. Check if userMessage and assistantMessage are defined

Solution:
1. Verify API response format
2. Check chat.controller.js returns both messages
3. Verify messageData extraction logic
```

### Issue: Temp message not rolled back on error
```
Diagnosis:
1. Check console for error logs
2. Check if rollback set() is called
3. Check if temp message ID matches

Solution:
1. Verify catch block is executing
2. Verify temp ID format is correct
3. Check if message ID comparison works
```

---

## Regression Tests

### After Each Change
Run these tests to ensure nothing broke:

- [ ] Single message displays instantly
- [ ] Multiple messages in correct order
- [ ] Error results in message removal
- [ ] Page refresh preserves messages
- [ ] New conversation doesn't show old messages
- [ ] Sidebar conversation list updates
- [ ] Assistant response arrives after user message
- [ ] Can send new message after error and retry

---

## Sign-off Checklist

- [ ] All test cases passed
- [ ] No console errors
- [ ] No duplicate messages
- [ ] No orphaned temp messages
- [ ] Message IDs transition correctly
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] UX feels responsive
- [ ] Ready for production

