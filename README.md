# Digital Practice Worksheets

A comprehensive web-based worksheet system for practicing Mathematics, English, and German (B1 level). Designed with a clean, minimal interface for focused learning.

## 📚 Features

- **Clean, minimal design** - Minimal distractions, maximum focus
- **Built-in timer** - Track completion time for each worksheet
- **Auto-grading** - Instant feedback with ✓ and ✗ marks
- **Answer keys** - Toggle to show/hide correct answers
- **Save as PDF** - Download worksheets with date-time stamps
- **Random generation** - Unlimited unique worksheets at each level
- **Mobile-friendly** - Works on iPad, tablets, and smartphones
- **Offline-capable** - No internet required once loaded

## 🎯 Available Subjects

### 📐 Mathematics (Kids)
**4 Operations × 5 Levels = 20 Worksheet Types**

#### ➕ Addition
- Level 6A: Addition to 5 (1+1, 2+1)
- Level 5A: Addition to 10 (3+4, 5+2)
- Level 4A: Addition to 20 (8+7, 9+6)
- Level 3A: Two-digit + One-digit (23+5)
- Level 2A: Two-digit + Two-digit (23+45)

#### ➖ Subtraction
- Level 6A: Subtraction within 5 (5-2, 4-1)
- Level 5A: Subtraction within 10 (10-5, 8-3)
- Level 4A: Subtraction within 20 (15-7, 18-9)
- Level 3A: Two-digit - One-digit (23-5)
- Level 2A: Two-digit - Two-digit (45-23)

#### ✖️ Multiplication
- Level 6A: Multiply by 1 and 2 (2×3, 1×5)
- Level 5A: Multiply by 3, 4, 5 (3×4, 5×6)
- Level 4A: Multiply by 6, 7, 8, 9 (7×8, 9×6)
- Level 3A: Two-digit × One-digit (12×3)
- Level 2A: Two-digit × Two-digit (12×13)

#### ➗ Division
- Level 6A: Divide by 1 and 2 (6÷2, 8÷2)
- Level 5A: Divide by 3, 4, 5 (15÷3, 20÷4)
- Level 4A: Divide by 6, 7, 8, 9 (48÷6, 63÷7)
- Level 3A: Two-digit ÷ One-digit (24÷3)
- Level 2A: Division with remainders (25÷3 = 8 R1)

### 📚 English (Kids)
**8 Levels - Progressive Difficulty**

- **Level 7A**: Picture Words 🖼️ - Look at emoji pictures and complete words (D_G → dog)
- **Level 6A**: Sight Words (Basic) - the, and, is, a, to, in, it
- **Level 5A**: Simple Sentences - Fill in blanks with correct words
- **Level 4A**: Sentence Completion - Grammar practice
- **Level 3A**: Synonyms & Antonyms - Similar and opposite meanings
- **Level 2A**: Parts of Speech - Identify nouns, verbs, adjectives
- **Level A**: Reading Comprehension - Short passages with questions
- **Level B**: Advanced Grammar - Sentence correction, punctuation

### 🇩🇪 German B1 (Adults)
**DTZ Test Preparation - 8 Practice Modules**

- **Artikel**: der, die, das - Definite & indefinite articles
- **Fälle**: Nominativ, Akkusativ, Dativ cases
- **Verben**: Present, past, perfect tense conjugations
- **Präpositionen**: mit, zu, nach, für, aus, bei, in, etc.
- **Adjektivendungen**: Adjective declension practice
- **Leseverstehen**: Reading comprehension (DTZ-style passages)
- **Wortschatz**: B1 essential vocabulary (German ↔ English)
- **Schreiben**: Writing prompts (formal letters, informal emails)

## 🚀 Quick Start

### Starting the Server

1. Open a terminal in the worksheet directory:
   ```bash
   cd /home/sabari/kumon-claude
   ```

2. Start the web server:
   ```bash
   python3 -m http.server 8080
   ```

3. You should see:
   ```
   Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
   ```

### Accessing on Your Computer

Open your web browser and go to:
```
http://localhost:8080/index.html
```

### Accessing on iPad/Tablet/Phone

1. Make sure your device is on the **same WiFi network** as your computer

2. Find your computer's IP address:
   ```bash
   hostname -I | awk '{print $1}'
   ```
   Example output: `192.168.0.66`

3. On your iPad/tablet, open Safari or Chrome and go to:
   ```
   http://[YOUR-IP-ADDRESS]:8080/index.html
   ```
   Example: `http://192.168.0.66:8080/index.html`

### Stopping the Server

Press `Ctrl+C` in the terminal, or run:
```bash
pkill -f "python3 -m http.server 8080"
```

## 📱 Using the Worksheets

### Step-by-Step Guide

1. **Select a Subject**: Math, English, or German
2. **Choose Operation/Level**: Select difficulty level
3. **Enter Name**: Pre-filled with "Karthigai Selvi" (editable)
4. **Start Timer**: Click "Start Timer" to track completion time
5. **Complete Problems**:
   - Type answers in input fields
   - Press Enter to move to next question
   - On iPad: Use Safari for best numeric keyboard support
6. **Check Answers**: Click "Check Answers" to see results
7. **View Answer Key**: Toggle answer key on/off
8. **Save as PDF**: Download worksheet with timestamp

### PDF Filenames

Worksheets are automatically saved with descriptive filenames:
- Math: `Addition_Worksheet_5A_20260211_143025.pdf`
- English: `English_Worksheet_7A_20260211_143025.pdf`
- German: `German_B1_articles_20260211_143025.pdf`

Format: `Subject_Type_Level_YYYYMMDD_HHMMSS.pdf`

## ⚙️ Technical Details

### File Structure

```
kumon-claude/
├── index.html              # Main page (subject selection)
├── english.html            # English level selection
├── german.html             # German module selection
├── styles.css              # Shared styling (clean design)
├── worksheet-generator.js  # Math worksheet generator
├── english-generator.js    # English worksheet generator
├── german-generator.js     # German worksheet generator
└── README.md               # This file
```

### Requirements

- **Python 3** (for local web server)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** (only for PDF generation library - html2pdf.js)

### Browser Compatibility

- ✅ **Safari** (Recommended for iPad) - Best keyboard support
- ✅ **Chrome** - Full support on desktop
- ✅ **Firefox** - Full support
- ✅ **Edge** - Full support
- ⚠️ **Chrome on iPad** - May require manual keyboard switching

## 🎓 Learning Tips

### For Math Practice
- Start with Level 6A and progress upward
- Aim for 100% accuracy before moving to next level
- Use timer to track improvement over time
- Practice daily for 10-15 minutes

### For English Practice
- Begin with Level 7A (Picture Words) for vocabulary
- Progress through levels systematically
- Practice sight words until automatic
- Read comprehension passages multiple times

### For German B1 Practice
- Focus on one grammar topic at a time
- Practice articles and cases daily
- Read passages aloud for pronunciation
- Complete writing exercises regularly
- Use answer keys to learn patterns

## 🐛 Troubleshooting

### Can't Connect from iPad

**Problem**: Can't access `http://192.168.0.66:8080/index.html`

**Solutions**:
1. Check both devices are on the same WiFi network
2. Verify the IP address is correct: `hostname -I`
3. Make sure the server is running: `ps aux | grep http.server`
4. Try restarting the server
5. Check firewall settings (allow port 8080)

### Keyboard Shows Letters Instead of Numbers (iPad)

**Problem**: iPad shows alphabetic keyboard for math problems

**Solutions**:
1. Use **Safari** instead of Chrome on iPad
2. Tap the `.?123` button to switch to numeric keyboard
3. For Division Level 2A: Alphabetic keyboard is intentional (for "R" in remainders)

### PDF Won't Download

**Problem**: "Save as PDF" button doesn't work

**Solutions**:
1. Check internet connection (needs html2pdf.js library)
2. Allow pop-ups in browser settings
3. Check browser's download settings
4. Try a different browser

### Timer Not Working

**Problem**: Timer doesn't start or shows incorrect time

**Solutions**:
1. Click "Start Timer" button
2. Refresh the page and try again
3. Check browser console for errors (F12)

### Answers Not Checking Correctly

**Problem**: Correct answers marked as wrong

**Solutions**:
1. Check for extra spaces in your answer
2. For German: Check capitalization (der vs Der)
3. For Division with remainders: Use format "8 R1" (space before R)
4. Refresh and try a new worksheet

## 🔒 Privacy & Data

- **All data stays local** - No information sent to external servers
- **No user accounts** - No login required
- **No tracking** - No analytics or cookies
- **Offline-capable** - Works without internet (except PDF save)
- **Student name** is only stored in the current session

## 🎨 Customization

### Changing the Pre-filled Name

Edit the respective generator file:
- Math: `worksheet-generator.js` - Line with `value="Karthigai Selvi"`
- English: `english-generator.js` - Line with `value="Karthigai Selvi"`
- German: `german-generator.js` - Line with `value="Karthigai Selvi"`

### Adjusting Problem Count

Edit the `levelConfigs` object in the generator files:
```javascript
problemCount: 20  // Change to desired number
```

### Adding More Words/Problems

Edit the word banks and problem arrays in the generator files:
- Math: Add to level generator functions
- English: Add to `wordBanks` object
- German: Add to `germanContent` object

## 📊 Problem Counts

### Math
- 20 problems per worksheet (all operations, all levels)

### English
- Level 7A: 12 problems (Picture Words)
- Level 6A, 5A: 15 problems (Sight Words)
- Level 4A, 3A, 2A: 12-15 problems
- Level A: 8 questions (Reading Comprehension)
- Level B: 12 problems (Advanced Grammar)

### German B1
- Articles: 15 problems
- Cases: 12 problems
- Verbs: 12 problems
- Prepositions: 12 problems
- Adjectives: 10 problems
- Reading: 8 questions
- Vocabulary: 15 words
- Writing: 1 prompt with guided points

## 🌐 Remote Access (Optional)

### Using GitHub Pages (Free Hosting)

1. Create a GitHub account
2. Create a new repository named `kumon-worksheets`
3. Push the files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/kumon-worksheets.git
   git push -u origin main
   ```
4. Enable GitHub Pages in repository settings
5. Access from anywhere: `https://YOUR-USERNAME.github.io/kumon-worksheets/`

### Using Ngrok (Temporary Public URL)

1. Install ngrok: https://ngrok.com/
2. Start the local server (port 8080)
3. Run: `ngrok http 8080`
4. Use the provided URL (valid for 2 hours on free plan)

## 🤝 Credits

Created using Claude Code by Anthropic. Designed for repetitive practice and skill mastery.

## 📄 License

Free to use for personal and educational purposes.

---

**Enjoy your practice! 📚✨**

For questions or issues, check the Troubleshooting section above.
