# Frontend Issues for Contributors

This file contains a curated list of frontend issues suitable for open source contributors. 
These issues have been created on GitHub at: https://github.com/RajMandal17/makemycraftsEcom/issues

---

## 🟢 Good First Issues (Beginner Friendly)

### Issue 1: Add Loading Skeleton Components
**Labels:** `good first issue`, `enhancement`, `frontend`, `UI/UX`

**Description:**
Currently, while data is loading, the app shows a basic spinner or blank space. We should add skeleton loading components (shimmer effect) for a better user experience.

**Affected Components:**
- `ArtworkCard.tsx` - Add skeleton for artwork cards
- `ArtistCard.tsx` - Add skeleton for artist cards (if exists)
- `ArtworksPage.tsx` - Show skeleton grid while loading

**Acceptance Criteria:**
- [ ] Create a reusable `Skeleton` component in `components/ui/`
- [ ] Implement skeleton for artwork cards matching their layout
- [ ] Skeleton should animate with a shimmer effect
- [ ] Replace loading spinners with skeleton components

**Resources:**
- [React Loading Skeleton](https://www.npmjs.com/package/react-loading-skeleton)
- [Framer Motion](https://www.framer.com/motion/) (already in project)

---

### Issue 2: Add Dark Mode Toggle Persistence
**Labels:** `good first issue`, `enhancement`, `frontend`

**Description:**
The app supports dark mode, but the user's preference is not persisted across sessions. Users have to toggle dark mode every time they reload.

**Current Behavior:**
- Dark mode resets to default on page refresh

**Expected Behavior:**
- Dark mode preference should be saved in `localStorage`
- On page load, check `localStorage` and apply saved preference
- Fallback to system preference (`prefers-color-scheme`) if no saved preference

**Affected Files:**
- `src/hooks/useTheme.ts`
- `src/context/` (if a theme context exists)

**Acceptance Criteria:**
- [ ] Save dark mode preference to localStorage
- [ ] Load preference on app initialization
- [ ] Respect system preference as default

---

### Issue 3: Improve Mobile Responsiveness on ArtworkDetailPage
**Labels:** `good first issue`, `bug`, `frontend`, `mobile`

**Description:**
The `ArtworkDetailPage` has some layout issues on mobile devices smaller than 375px width. The image gallery and product details need better responsive styling.

**Steps to Reproduce:**
1. Open https://makemycrafts.com/artworks/{any-artwork-id}
2. Use Chrome DevTools to simulate iPhone SE (375px)
3. Notice layout overflow issues

**Acceptance Criteria:**
- [ ] Image gallery should not overflow on small screens
- [ ] Price and "Add to Cart" button should be fully visible
- [ ] Text should not get truncated improperly

---

### Issue 4: Add "Back to Top" Button
**Labels:** `good first issue`, `enhancement`, `frontend`, `UI/UX`

**Description:**
On long pages like `ArtworksPage` and `ArtistsPage`, users have to scroll all the way back to the top. A floating "Back to Top" button would improve UX.

**Requirements:**
- Button should appear after scrolling down 300px
- Smooth scroll animation to top
- Button should be styled consistently with the design system
- Use `lucide-react` icon (already in project)

**Acceptance Criteria:**
- [ ] Create `BackToTop.tsx` component in `components/common/`
- [ ] Add to `ArtworksPage`, `ArtistsPage`, and `HomePage`
- [ ] Smooth scroll animation
- [ ] Button fades in/out based on scroll position

---

## 🟡 Intermediate Issues

### Issue 5: Implement Image Lazy Loading with Blur Placeholder
**Labels:** `enhancement`, `frontend`, `performance`

**Description:**
To improve page load performance, artwork images should be lazy loaded with a blurred placeholder. Currently, all images load immediately, which slows down initial page render.

**Technical Approach:**
- Use `react-intersection-observer` (already installed)
- Show a low-quality blurred placeholder initially
- Load full image when in viewport

**Affected Components:**
- `ArtworkCard.tsx`
- `ArtworkGrid.tsx`
- `ProductCarousel.tsx`

**Acceptance Criteria:**
- [ ] Images load only when in viewport
- [ ] Show blur placeholder (can use CSS blur on tiny thumbnail)
- [ ] Smooth transition from placeholder to full image
- [ ] No layout shift when image loads (maintain aspect ratio)

---

### Issue 6: Add Search Functionality with Debounce
**Labels:** `enhancement`, `frontend`, `feature`

**Description:**
Implement a global search bar in the header that allows users to search for artworks by title, description, or artist name. The search should use debouncing to reduce API calls.

**Requirements:**
- Search input in `Header.tsx`
- Debounce search input by 300ms
- Show dropdown with search results
- Navigate to artwork detail on click
- "See all results" link to full search page

**Acceptance Criteria:**
- [ ] Add search input to header
- [ ] Implement debounce hook
- [ ] Create search results dropdown component
- [ ] Integrate with backend search API (GET /api/artworks?search=query)

---

### Issue 7: Add Unit Tests for Utility Functions
**Labels:** `enhancement`, `frontend`, `testing`

**Description:**
The project uses Vitest for testing but coverage is low. Add unit tests for utility functions.

**Files to Test:**
- `src/utils/tokenManager.ts`
- `src/utils/authConsistencyChecker.ts`
- `src/hooks/useForm.ts`

**Acceptance Criteria:**
- [ ] Add tests for all exported functions in target files
- [ ] Achieve >80% coverage for these files
- [ ] Tests should be in `__tests__/` directories

---

### Issue 8: Implement Infinite Scroll on Artworks Page
**Labels:** `enhancement`, `frontend`, `feature`

**Description:**
Replace pagination with infinite scroll on the `ArtworksPage` for a more seamless browsing experience.

**Technical Approach:**
- Use `react-intersection-observer` to detect when user reaches bottom
- Load next page of artworks
- Show loading indicator while fetching

**Acceptance Criteria:**
- [ ] Load more artworks when user scrolls to bottom
- [ ] Show loading spinner during fetch
- [ ] Handle end of results gracefully
- [ ] Maintain scroll position when navigating back

---

## 🔴 Advanced Issues

### Issue 9: Implement Offline Support with Service Worker
**Labels:** `enhancement`, `frontend`, `PWA`, `advanced`

**Description:**
Add Progressive Web App (PWA) capabilities with offline support. Users should be able to view previously loaded artworks when offline.

**Requirements:**
- Register service worker
- Cache static assets and API responses
- Show offline indicator when connection is lost
- Gracefully handle offline state

**Acceptance Criteria:**
- [ ] Add service worker with Vite PWA plugin
- [ ] Cache artwork images and listing data
- [ ] Show "You are offline" banner when disconnected
- [ ] App should be installable on mobile devices

---

### Issue 10: Implement Real-time Notifications with WebSocket
**Labels:** `enhancement`, `frontend`, `feature`, `websocket`, `advanced`

**Description:**
The backend supports WebSocket. Implement real-time notifications for:
- Order status updates (for customers)
- New order alerts (for artists)
- Admin dashboard live updates

**Technical Stack:**
- `@stomp/stompjs` (already installed)
- `sockjs-client` (already installed)

**Acceptance Criteria:**
- [ ] Connect to WebSocket endpoint `/ws`
- [ ] Subscribe to user-specific notification channels
- [ ] Display toast notifications for real-time events
- [ ] Implement reconnection logic

---

## How to Pick an Issue

1. Comment on the issue to claim it
2. Fork the repository
3. Create a feature branch: `git checkout -b feature/issue-number-short-description`
4. Make your changes
5. Write/update tests
6. Submit a Pull Request referencing the issue

**Questions?** Feel free to ask in the issue comments or start a Discussion!
