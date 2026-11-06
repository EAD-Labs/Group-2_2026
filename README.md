# DiagnoMath

**DiagnoMath** is an offline, lightweight mobile application designed for Class 6–7 Mathematics teachers to conduct assessments, scan student answer sheets, and perform **Cognitive Diagnostic Assessment (CDA)** using the **DINA (Deterministic Inputs, Noisy AND gate)** model.

The entire application runs **100% offline on a simple smartphone** inside a single standalone Android APK—with **zero backend servers, zero Python runtime, zero cloud APIs, and zero network calls**.

---

## Key Features

### 1. 📷 Intelligent Dual-Engine Answer Sheet Scanner (OMR + Handwritten OCR)
* **Unified Scanner**: Automatically detects whether an uploaded photo is a printed OMR bubble sheet or a handwritten answer paper, routing to the appropriate engine in < 300 ms.
* **Instant Engine Switcher**: Teachers can freely toggle between **`[✏️ Handwritten OCR]`** and **`[⊙ Bubble OMR]`** at any time without re-uploading.
* **Always-Accessible UI**: Persistent camera and gallery buttons ensure teachers never get stuck on an error state; instant retry and image preview thumbnails are always visible.
* **Interactive Option Cycling**: Tap any scanned answer to cycle through options:
  $$\text{A} \to \text{B} \to \text{C} \to \text{D} \to \text{Not Attempted (NA)} \to \text{Blank}$$

---

### 2. ✂️ 2-Layer Precision Image Cropping System
* **Layer 1: Native OS Cropper**:
  - Automatically launches the native system crop tool (`allowsEditing: true`) immediately upon selecting a photo from the gallery or taking a photo with the camera.
  - Allows rotating, scaling, and framing the answers region.
* **Layer 2: In-App Interactive Cropper (`ImageCropperModal`)**:
  - Tap the **`[✂️ Crop]`** button on the image card at any time to re-crop an already-loaded image.
  - Features an interactive draggable crop box with 3×3 rule-of-thirds grid lines and corner anchor handles.
  - **1-Tap Quick Presets**: `[Full Sheet]`, `[Center Area]`, `[Top Half]`, `[Bottom Half]`.
  - **Fine-Tuning Margin Steppers**: Micro-adjust Top and Bottom trim (+/- 5%) to cut out table edges, page margins, or phone shadows.
  - Crops natively via `expo-image-manipulator` and immediately re-runs recognition in ~200 ms.

---

### 3. ✏️ High-Accuracy Handwritten OCR Engine (`@react-native-ml-kit/text-recognition`)
* **All 5 Answer States Supported**:
  - Options **A**, **B**, **C**, **D**
  - **Not Attempted (5th Way)**: Automatically recognized from `e`, `E`, `na`, `n/a`, `skip`, `-`, `unattempted`, `blank`, or `nil`.
* **Dual Writing Styles Supported**:
  - **Style 1 (Direct Options)**: `A B C D E` written horizontally or as a vertical column (`A \n B \n C \n D \n E`).
  - **Style 2 (Numbered Options)**: Numbered lists like `1 A`, `2 C`, `3 B`, `4 A`, `1. A`, `1) A`, `1: A`, `1 - A`, etc.
* **Self-Correction & Right-to-Left Scanning**:
  - If a student makes a mistake and overwrites their answer (e.g. `1 B A`), the parser scans right-to-left and picks the final corrected candidate (`A`).
* **Softmax Neural Character Scorer (`neuralCharScorer.ts`)**:
  - Temperature-scaled Softmax logit weights evaluate character morphology, resolving common handwriting ambiguities:
    - `4` or `^` or `@` $\to \text{Option A}$
    - `8` or `13` or `|3` $\to \text{Option B}$
    - `(` or `[` or `<` $\to \text{Option C}$
    - `0` or `|)` or `]` $\to \text{Option D}$
  - Recovers OCR digit misreads in question numbering (`y` or `ч` $\to 4$, `l` or `i` or `|` $\to 1$, `z` $\to 2$, `s` $\to 5$, etc.).
* **Semantic Option Value Matching**:
  - If a student writes the numerical value or option text (e.g. `2/3`, `Proper fraction`, `0.75`), the engine automatically correlates it with the question bank's answer options.

---

### 4. ⊙ Robust Offline OMR Bubble Scanner (80–95%+ Accuracy)
* **Corner Registration Markers**: Generated sheet templates place solid $24 \times 24\text{px}$ fiducial squares in all 4 corners to detect page shift ($\Delta x, \Delta y$) and scale ($s_x, s_y$).
* **16-Point Radial Ring Contrast Auto-Centering ($\pm 14\text{px}$)**: Samples 16 points along the perimeter ring vs 8 points outside to lock directly onto circle perimeters without false-positive pulls.
* **Dual-Metric Fill Detection (Anti-Shadow)**:
  - Combines inner dark-pixel ratio ($r \le 0.65R$) binarized against local background threshold ($T = L_{\text{bg}} - 35$) with mean contrast ratio against the immediate surrounding paper ring.
  - Eliminates shadow and ambient lighting false-positives under smartphone cameras.

---

### 5. 🧠 Offline Q-Matrix Engine (`prajjwal1/bert-tiny`)
* **100% On-Device AI**: Powered by a pure TypeScript implementation of the **`prajjwal1/bert-tiny`** 128-dimensional Transformer encoder (2 layers, 2 attention heads, 128 hidden dim).
* **Automatic Skill Tagging**: When teachers import custom questions from CSV or Excel without skill annotations, `bert-tiny` classifies them into the 12 Fractions Cognitive Attributes in < 5 ms directly on the phone's CPU.
* **Deterministic Binary Q-Matrix**: Produces the $J \times 12$ binary matrix ($q_{jk} \in \{0, 1\}$) required for cognitive diagnosis.

#### The 12 Fractions Cognitive Attributes:
| ID | Attribute Name | Description |
|---|---|---|
| **A1** | Numerator & Denominator Identification | Identifying top and bottom parts of a fraction |
| **A2** | Fraction Representation | Representing parts of a whole or shaded diagrams |
| **A3** | Fraction Classification | Proper, improper, and mixed numbers |
| **A4** | Fraction Simplification | Reducing fractions to lowest terms |
| **A5** | Equivalent Fractions | Verifying and scaling equivalent values |
| **A6** | Fraction Comparison | Comparing values ($>, <, =$) |
| **A7** | Fraction Ordering | Ascending and descending sequence arrangement |
| **A8** | Mixed / Improper Conversion | Converting between mixed numbers and improper fractions |
| **A9** | Like-Denominator Addition | Adding fractions with identical denominators |
| **A10** | Unlike-Denominator Addition | Finding common denominators (LCM) and adding |
| **A11** | Fraction Subtraction | Subtracting like and unlike fractions |
| **A12** | Word Problems / Applications | Real-world problem solving (sharing, recipes, tanks) |

---

### 6. 📊 DINA Cognitive Diagnosis & Question-by-Question Breakdown
* **Cognitive Mastery Estimation**: Uses student response vectors $\mathbf{X} \in \{0, 1\}^J$ and the binary Q-matrix $Q \in \{0, 1\}^{J \times K}$ to evaluate all $2^K$ latent skill profiles $\boldsymbol{\alpha} = (\alpha_1, \dots, \alpha_K)$.
* **Subtopic Breakdown**: Maps performance to specific mathematical subtopics (e.g. *Like-Denominator Addition*, *Fraction Simplification*).
* **Question-by-Question Review Cards**:
  - Each question shows: Question prompt, Student's Chosen Option, Correct Option, Subtopic badge, and status (**✅ Right**, **❌ Wrong**, or **⚪ Not Attempted**).
* **Actionable Teacher Guidance**: Identifies specific cognitive bottlenecks rather than just aggregate percentages.

---

### 7. 🎲 Offline Auto Quiz Generator & PDF Export
* **Mixed-Concept Generation**: Generates balanced math quizzes blending multi-attribute questions with single-skill questions across selected topics.
* **Single-Tap PDF Printing**: Exports formatted Question Papers and standard OMR Bubble Sheets directly via the Android OS Print Spooler (`expo-print` + `expo-sharing`).
* **Offline Security & Storage**: Salted SHA-256 password hashing (`expo-crypto`) and local storage (`AsyncStorage`).

---

## Project Structure

```
DiagnoMath/
├── my-app/                         # Main React Native / Expo mobile application
│   ├── app/                        # Expo Router screen navigation
│   │   ├── (tabs)/                 # Bottom navigation tabs (Home, Explore)
│   │   ├── auto-quiz.tsx           # Auto-quiz generator with Mixed Concepts toggle
│   │   ├── scan.tsx                # Universal Answer Sheet Scanner (OCR + OMR)
│   │   ├── handwritten-scan.tsx    # Dedicated Handwritten OCR Scanner
│   │   ├── questions-import.tsx    # CSV/Excel importer with BERT-tiny auto-tagging
│   │   ├── tests-create.tsx        # Test creator
│   │   ├── results.tsx             # Test results list
│   │   └── results-detail.tsx      # Detailed DINA cognitive diagnosis & question cards
│   ├── components/
│   │   ├── ImageCropperModal.tsx   # Touch-enabled in-app image cropper with presets
│   │   ├── omr/BubbleScanner.tsx   # Dual-engine scanner (OMR + OCR) with image preview
│   │   └── handwritten/            # Handwritten scanner component
│   ├── lib/
│   │   ├── handwritten/            # Multi-format handwriting parser & Softmax neural scorer
│   │   │   ├── parseAnswerText.ts  # Multi-strategy answer extraction (5 ways, 2 styles)
│   │   │   └── neuralCharScorer.ts # Pre-calibrated logit weights & digit normalization
│   │   ├── diagnosis/              # DINA mathematical cognitive model & subtopic labels
│   │   │   ├── analyze.ts          # Scan analysis, question details, unattempted logic
│   │   │   ├── dina.ts             # DINA latent class solver
│   │   │   └── skillLabels.ts      # Subtopic & skill attribute mapping
│   │   ├── qmatrix/                # 100% offline prajjwal1/bert-tiny engine
│   │   │   ├── bert-tiny/          # Tokenizer, Transformer model, prototypes, classifier
│   │   │   └── index.ts            # Public Q-matrix & auto-tagging APIs
│   │   ├── quiz/                   # Mixed-concept generator & Fractions question bank
│   │   ├── omr/                    # Layout geometry & headless canvas scanner HTML
│   │   └── auth/                   # Offline crypto & AsyncStorage session manager
│   └── package.json
└── q-matrix/                       # Companion Node.js module & validator tools
    ├── src/
    │   ├── attributes.js           # 12 Fractions cognitive attributes definition
    │   ├── qmatrix.js              # Deterministic Q-matrix generator
    │   ├── validator.js            # Structural & matrix validator
    │   └── bert-qmatrix.js         # Offline bert-tiny classifier for Node.js
    └── data/                       # Sample test fixtures (JSON & CSV)
```

---

## Getting Started

### Prerequisites
* Node.js 18+
* npm or yarn
* Expo CLI (`npm install -g expo-cli`)

### Running the Mobile App
```bash
cd my-app
npm install
npx expo start
```
Scan the QR code using the **Expo Go** app on your Android phone, or run directly on an Android emulator / connected USB device:
```bash
npx expo run:android
```

---

## Building the Standalone Offline APK

The app is fully configured to generate an independent Android APK that requires no internet connection to operate:

```bash
cd my-app

# Option A: Build standalone preview APK via EAS
npx eas build --profile preview --platform android

# Option B: Build locally via Gradle
npx expo prebuild
cd android && ./gradlew assembleRelease
```

The resulting `.apk` can be transferred directly to any Android smartphone via USB or Bluetooth and installed without an active internet connection.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
