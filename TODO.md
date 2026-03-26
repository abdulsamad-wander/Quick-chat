# Chat App Fetching Fixes - TODO

## Plan Implementation Steps:
- [x] Step 1: Update SideBar.jsx - Remove manual unSeenMessages reset in user onClick handler
- [x] Step 2: Update ChatContext.jsx - Add loading states (isLoadingUsers, isLoadingMessages) and refresh getUsers after successful markMessagesAsSeen
- [ ] Step 3: Test fetching - Select users, verify messages load, unseen counts sync correctly
- [ ] Step 4: Verify socket message marking across chats

**All code updates complete. Ready for testing.**
