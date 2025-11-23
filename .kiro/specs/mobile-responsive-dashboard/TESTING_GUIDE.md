# Mobile Responsive Testing Guide

## Quick Start

### Option 1: Browser DevTools (Recommended for Quick Testing)

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Open the dashboard** in your browser:
   ```
   http://localhost:3000/farmer-dashboard?role=farmer
   ```

3. **Open DevTools**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

4. **Enable Device Toolbar**:
   - Chrome/Edge: Press `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)
   - Or click the device icon in DevTools toolbar

5. **Test at each breakpoint**:
   - Select "Responsive" mode
   - Enter width manually: `320`, `375`, `414`, `768`
   - Or select preset devices: iPhone SE, iPhone 12, iPad Mini

### Option 2: Testing Tool (Visual Comparison)

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Open the testing tool**:
   ```
   .kiro/specs/mobile-responsive-dashboard/test-responsive.html
   ```
   - Open this file directly in your browser
   - It will load the dashboard in an iframe at different sizes

3. **Use preset buttons** to test different breakpoints

4. **Run automated tests** to check for common issues

### Option 3: Physical Device Testing (Most Accurate)

1. **Start the development server** on your computer

2. **Find your local IP address**:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

3. **Access from mobile device**:
   ```
   http://YOUR_IP_ADDRESS:3000/farmer-dashboard?role=farmer
   ```
   Example: `http://192.168.1.100:3000/farmer-dashboard?role=farmer`

4. **Ensure both devices are on the same network**

---

## Testing Checklist

### Critical Breakpoints to Test

| Breakpoint | Width | Device Examples | Key Changes |
|------------|-------|-----------------|-------------|
| **320px** | 320px | iPhone SE, old Android | Smallest mobile, most constrained |
| **375px** | 375px | iPhone 12/13/14 | Standard mobile |
| **414px** | 414px | iPhone Plus, large Android | Large mobile |
| **768px** | 768px | iPad Mini, tablets | Tablet breakpoint, layout changes |

### Quick Visual Checks

At each breakpoint, verify:

1. ✅ **No horizontal scrolling** (except in data tables)
2. ✅ **All text is readable** (not too small)
3. ✅ **Buttons are tappable** (not too small or close together)
4. ✅ **Content doesn't overflow** (no cut-off text or images)
5. ✅ **Modals fit on screen** (can see entire modal)

---

## Detailed Testing Steps

### 1. Navigation Bar (All Breakpoints)

**What to check:**
- Logo and app name are visible
- Language switcher works
- Profile menu opens correctly
- No elements overlap

**How to test:**
1. Look at the top navigation bar
2. Click the profile button
3. Verify dropdown appears without issues
4. Click language switcher
5. Verify it works correctly

**Expected behavior:**
- At 320-767px: Compact layout, smaller icons
- At 768px+: Larger icons and text

---

### 2. Weather Widget

**What to check:**
- Temperature and humidity are readable
- Layout changes at breakpoints
- Location text doesn't overflow

**How to test:**
1. Scroll to weather widget (colorful gradient section)
2. Check if temperature and humidity are side-by-side or stacked
3. Verify all text is visible

**Expected behavior:**
- At 320-639px: Single column (stacked vertically)
- At 640px+: Two columns (side-by-side)

---

### 3. Animal Overview Section

**What to check:**
- Stat boxes display correctly
- "Manage Animals" button is accessible
- All numbers and labels are visible

**How to test:**
1. Find the "Animal Overview" section
2. Count the stat boxes (should be 4)
3. Click "Manage Animals" button
4. Verify modal opens

**Expected behavior:**
- At all sizes: 2×2 grid of stat boxes
- At 320-639px: Button is full-width
- At 640px+: Button is auto-width

---

### 4. Veterinary Services Section

**What to check:**
- Both buttons are visible and tappable
- Button text is not truncated
- Buttons have adequate spacing

**How to test:**
1. Find "Veterinary Services" section
2. Try tapping both buttons
3. Verify they're easy to tap

**Expected behavior:**
- At 320-639px: Buttons stack vertically, full-width
- At 640px+: Buttons side-by-side

---

### 5. Alerts Section

**What to check:**
- Alert messages are readable
- "Add Report" button works
- Alerts scroll if many exist

**How to test:**
1. Find "Live Alerts" section
2. Click "Add Report" button
3. Add a test alert
4. Verify it appears correctly

**Expected behavior:**
- At 320-639px: Button is full-width
- At 640px+: Button is auto-width
- Alerts always stack vertically

---

### 6. Analytics Charts

**What to check:**
- Charts are visible and readable
- Legends are not cut off
- Charts respond to touch/click

**How to test:**
1. Scroll to charts section
2. Try tapping on chart bars/lines
3. Verify tooltips appear
4. Check if legends are readable

**Expected behavior:**
- At 320-1023px: Charts stack vertically (single column)
- At 1024px+: Charts side-by-side (2 columns)
- Chart height: 250px on mobile

---

### 7. Modal Testing

#### Animal Selection Modal

**How to test:**
1. Click "Manage Animals" button
2. Verify modal appears centered
3. Try tapping "Manage Pigs" button
4. Verify it opens animal records

**Expected behavior:**
- Modal fits within viewport
- Buttons are full-width
- Easy to tap all buttons
- Close button works

#### Animal Records Modal

**How to test:**
1. Open animal selection modal
2. Select "Manage Pigs" or "Manage Chickens"
3. Click "Add New Entry"
4. Verify form appears
5. Try filling out the form
6. Check if table scrolls horizontally

**Expected behavior:**
- Modal fits viewport height
- Form fields stack vertically on mobile
- Form fields are full-width
- Table scrolls horizontally
- All inputs are tappable

#### Add Report Modal

**How to test:**
1. Click "Add Report" button in Alerts section
2. Verify modal appears
3. Try selecting alert type
4. Try typing in textarea
5. Click submit

**Expected behavior:**
- Modal fits viewport
- Dropdown is full-width
- Textarea is full-width
- Submit button is full-width
- All elements are tappable

#### Report Condition Modal

**How to test:**
1. Click "Report Condition" button
2. Verify modal appears
3. Try filling out all fields
4. Click submit

**Expected behavior:**
- Modal fits viewport
- All inputs are full-width
- All inputs meet 44px height
- Easy to interact with all fields

---

### 8. Form Input Testing

**What to check:**
- Keyboard doesn't obscure inputs
- Can type in all fields
- Dropdowns work correctly

**How to test (on mobile device):**
1. Open any modal with a form
2. Tap on a text input
3. Verify keyboard appears
4. Verify you can see what you're typing
5. Try all input types (text, number, date, select)

**Expected behavior:**
- Keyboard appears smoothly
- Input remains visible
- Can type without issues
- Dropdown options are readable

---

### 9. Touch Target Testing

**What to check:**
- All buttons are at least 44×44px
- Buttons have adequate spacing
- No accidental taps

**How to test:**
1. Try tapping all buttons on the page
2. Verify you can tap accurately
3. Check if buttons are too close together

**Expected behavior:**
- All buttons meet 44×44px minimum
- At least 8px spacing between buttons
- Easy to tap intended button

---

### 10. Horizontal Scrolling Test

**What to check:**
- No horizontal scrolling on main page
- Table scrolls horizontally (intentional)

**How to test:**
1. At each breakpoint, try scrolling horizontally
2. Verify you cannot scroll left/right
3. Open animal records modal
4. Verify table CAN scroll horizontally

**Expected behavior:**
- Main page: No horizontal scroll
- Animal records table: Horizontal scroll enabled

---

## Common Issues and Solutions

### Issue: Horizontal scrolling appears

**Possible causes:**
- Element has fixed width larger than viewport
- Padding/margin causing overflow
- Image not responsive

**How to fix:**
- Check for elements with `width: XXXpx` (fixed width)
- Add `max-width: 100%` to images
- Use responsive padding classes (`px-4 md:px-6`)

### Issue: Buttons too small to tap

**Possible causes:**
- Missing `min-h-[44px]` class
- Padding too small

**How to fix:**
- Add `min-h-[44px]` to all buttons
- Add `py-2` or `py-3` for vertical padding

### Issue: Modal exceeds viewport

**Possible causes:**
- Modal height too large
- No scrolling enabled

**How to fix:**
- Add `max-h-screen` to modal
- Add `overflow-y-auto` to modal content

### Issue: Text too small to read

**Possible causes:**
- Font size too small on mobile
- Missing responsive text classes

**How to fix:**
- Use `text-sm md:text-base` pattern
- Ensure body text is at least 16px

---

## Test Results Documentation

### Recording Test Results

Use the provided checklist:
```
.kiro/specs/mobile-responsive-dashboard/RESPONSIVE_TEST_CHECKLIST.md
```

### Taking Screenshots

1. **Browser DevTools:**
   - Open DevTools
   - Set viewport size
   - Press `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (Mac)
   - Type "screenshot"
   - Select "Capture full size screenshot"

2. **Physical Device:**
   - Use device screenshot function
   - iPhone: Volume Up + Power button
   - Android: Volume Down + Power button

### Reporting Issues

When reporting issues, include:
1. **Breakpoint/Device**: e.g., "320px width" or "iPhone 12"
2. **Browser**: e.g., "Chrome 120" or "Safari iOS 17"
3. **Description**: What's wrong
4. **Screenshot**: Visual proof
5. **Expected behavior**: What should happen
6. **Actual behavior**: What actually happens

---

## Automated Testing

### Running the Test Tool

1. Open `test-responsive.html` in your browser
2. Click preset device buttons
3. Click "Run Automated Tests"
4. Review results

**Note:** Most tests require manual verification due to the visual nature of responsive design.

---

## Performance Testing

### Checking Scroll Performance

1. Open dashboard at mobile viewport
2. Scroll up and down quickly
3. Observe for:
   - Lag or stuttering
   - Delayed rendering
   - Janky animations

**Expected:** Smooth 60fps scrolling

### Checking Modal Performance

1. Open and close modals repeatedly
2. Observe for:
   - Delay in opening
   - Animation stuttering
   - Slow rendering

**Expected:** Instant modal appearance

---

## Browser Compatibility

### Browsers to Test

**Mobile:**
- Safari iOS (iPhone)
- Chrome Android
- Samsung Internet
- Firefox Mobile

**Desktop:**
- Chrome
- Firefox
- Edge
- Safari (Mac)

### Known Browser Differences

- **Safari iOS:** May handle touch events differently
- **Samsung Internet:** May have different default styles
- **Firefox:** May render fonts slightly differently

---

## Final Checklist

Before marking task as complete, verify:

- [ ] Tested at 320px width
- [ ] Tested at 375px width
- [ ] Tested at 414px width
- [ ] Tested at 768px width
- [ ] No horizontal scrolling (except tables)
- [ ] All touch targets meet 44×44px
- [ ] All modals work on mobile
- [ ] Form inputs work with mobile keyboard
- [ ] Charts are interactive on touch devices
- [ ] Tested on at least one physical device
- [ ] Tested in at least two browsers
- [ ] All critical issues resolved
- [ ] Documentation updated

---

## Next Steps

After completing testing:

1. Document any issues found
2. Create tickets for any bugs
3. Update the requirements if needed
4. Mark task as complete in tasks.md
5. Move to next task (Task 15: Accessibility Audit)

---

## Support

If you encounter issues during testing:

1. Check the design document for expected behavior
2. Review the requirements document
3. Check browser console for errors
4. Test on a different device/browser
5. Document the issue for review
