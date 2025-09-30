# Gallery Protection & Preloading - Testing Guide

## 🧪 Manual Testing Steps

### Test 1: Image Protection on Mobile

**Device:** iPhone/Android phone

1. Navigate to any apartment detail page
2. Click "Všetky fotky" button to open gallery
3. **Long-press** on the main image
   - ❌ **EXPECTED:** No context menu should appear
   - ❌ **EXPECTED:** No "Save Image" option
4. Try to **drag** the image
   - ❌ **EXPECTED:** Image should not move/drag
5. **Swipe left/right**
   - ✅ **EXPECTED:** Should navigate to next/previous image smoothly

### Test 2: Image Protection on Desktop

**Device:** Mac/Windows/Linux computer

1. Navigate to any apartment detail page
2. Click "Všetky fotky" to open gallery
3. **Right-click** on the main image
   - ❌ **EXPECTED:** No context menu should appear
4. Try to **drag** the image with mouse
   - ❌ **EXPECTED:** Image should not be draggable
5. Try to **select/highlight** the image
   - ❌ **EXPECTED:** Cannot select image
6. Use **arrow keys** (← →)
   - ✅ **EXPECTED:** Should navigate images
7. Use **ESC key**
   - ✅ **EXPECTED:** Should close gallery

### Test 3: Thumbnail Strip Protection

**Device:** Mobile & Desktop

1. Open gallery
2. Scroll to thumbnail strip at bottom
3. **Long-press/right-click** on thumbnails
   - ❌ **EXPECTED:** No context menu
4. **Click** on thumbnail
   - ✅ **EXPECTED:** Should jump to that image

### Test 4: Image Preloading

**Device:** Any (use Chrome DevTools)

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Filter by **Img**
4. Navigate to apartment page (DON'T open gallery yet)
   - ✅ **EXPECTED:** Only 1-2 images loaded (main + thumbnails)
5. Click "Všetky fotky" to open gallery
   - ✅ **EXPECTED:** Network tab shows progressive loading of images
   - ✅ **EXPECTED:** First 3-5 images load quickly
   - ✅ **EXPECTED:** Remaining images load in background
6. Switch to image #3-4
   - ✅ **EXPECTED:** No loading delay (already preloaded)

### Test 5: Performance Check

**Device:** Any

1. Open gallery with 10+ images
2. Rapidly swipe/arrow through images
   - ✅ **EXPECTED:** Smooth transitions, no loading spinners
   - ✅ **EXPECTED:** Images appear instantly
3. Check browser console
   - ✅ **EXPECTED:** No error messages
   - ✅ **EXPECTED:** No warnings about failed preloads

## 📊 Expected Network Behavior

### Before Opening Gallery:
```
✅ apartment-maly-1.jpg (main image)
✅ apartment-maly-2.jpg (thumbnail)
✅ apartment-maly-3.jpg (thumbnail)
✅ apartment-maly-4.jpg (thumbnail)
```

### After Opening Gallery (within 2-3 seconds):
```
Priority 1: ✅ Current image (if different)
Priority 2: ✅ Images ±1-2 positions
Priority 3: ✅ Images +3 to +5 positions
Priority 4: ⏳ Remaining images (background)
```

## 🐛 Known Issues to Check

### iOS Safari Specific:
- [ ] Long-press triggers iOS text selection magnifier?
  - **Fix:** Should be prevented by `-webkit-touch-callout: none`
- [ ] 3D Touch preview on image?
  - **Fix:** Should be prevented by `pointer-events: none`

### Chrome Mobile:
- [ ] Long-press shows "Search this image"?
  - **Fix:** Should be prevented by `onContextMenu` handler

### Desktop Browsers:
- [ ] Can select image with Ctrl+A / Cmd+A?
  - **Fix:** Should be prevented by `user-select: none`
- [ ] Can drag to new tab?
  - **Fix:** Should be prevented by `draggable={false}` + handlers

## ✅ Success Criteria

All tests must pass:
- [x] No context menu on mobile long-press
- [x] No context menu on desktop right-click
- [x] Cannot drag images
- [x] Cannot select/highlight images
- [x] Swipe navigation works smoothly
- [x] Keyboard navigation works
- [x] Thumbnails are clickable
- [x] Images preload only after opening gallery
- [x] No duplicate image requests
- [x] Smooth image transitions

## 🔧 Debugging Tips

### If context menu still appears:
1. Check browser console for JavaScript errors
2. Verify `handleContextMenu` is properly attached
3. Check if event propagation is stopped
4. Test in incognito mode (extensions can interfere)

### If preloading doesn't work:
1. Open DevTools → Network tab → Filter: Img
2. Check if `useImagePreloader` hook is called
3. Verify `isActive` prop is true when gallery opens
4. Check browser console for preload errors

### If images drag despite protection:
1. Check if `draggable={false}` is on `<Image>`
2. Verify `onDragStart` handler prevents default
3. Check CSS `pointer-events: none` is applied
4. Test with different browser/device

## 📝 Test Report Template

```
Date: ____________________
Tester: __________________
Device: __________________
Browser: _________________

Test 1 - Mobile Protection:     [ PASS / FAIL ]
Test 2 - Desktop Protection:    [ PASS / FAIL ]
Test 3 - Thumbnail Protection:  [ PASS / FAIL ]
Test 4 - Image Preloading:      [ PASS / FAIL ]
Test 5 - Performance:           [ PASS / FAIL ]

Issues Found:
_______________________________________
_______________________________________
_______________________________________

Notes:
_______________________________________
_______________________________________
_______________________________________
```

---

**Last Updated:** 2025-09-30

