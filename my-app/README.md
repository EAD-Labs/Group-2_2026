# DiagnoMath Mobile Client (`my-app`)

The core React Native / Expo application for **DiagnoMath**. Engineered to run **100% offline on Android smartphones** with zero backend servers, zero Python runtime, zero cloud APIs, and zero network calls.

---

## Capabilities & Architecture

* **Intelligent Dual-Engine Scanner**:
  - Automatically classifies input images as either handwritten answer sheets or printed OMR bubble sheets in < 300 ms.
  - Manual toggle bar allows switching between **`[✏️ Handwritten OCR]`** and **`[⊙ Bubble OMR]`** on the fly without re-uploading.
  - Persistent UI guarantees that camera/gallery upload buttons remain accessible in all states.
* **2-Layer Image Cropper**:
  - **Native OS Cropping**: Directly integrated into gallery & camera selection (`allowsEditing: true`).
  - **In-App Modal Cropper (`ImageCropperModal`)**: On-card `[✂️ Crop]` button opens a draggable 3×3 crop frame with presets (`Full Sheet`, `Center Area`, `Top Half`, `Bottom Half`) and fine-tuning margin steppers.
* **Smart Handwritten Answer OCR**:
  - **On-Device ML Kit Recognition**: 100% offline text extraction via `@react-native-ml-kit/text-recognition`.
  - **5 Answer States**: Correctly identifies `A`, `B`, `C`, `D`, and `Not Attempted` (`e`, `E`, `na`, `skip`, `-`, `unattempted`, `blank`).
  - **Dual Writing Styles**: Handles both direct options (`a b c d e`) and numbered questions (`1 A`, `2 C`, `3 B`, `4 A`).
  - **Softmax Neural Character Scorer (`neuralCharScorer.ts`)**: Temperature-scaled logit weights normalize handwriting OCR ambiguities (`4` $\to A$, `8` $\to B$, `(` $\to C$, `0` $\to D$, `y` / `ч` $\to 4$).
  - **Self-Correction Support**: Scans right-to-left to pick final overwritten choices (e.g. `1 B A` $\to A$).
  - **Semantic Option Value Matching**: Correlates written values (e.g. `2/3`, `Proper fraction`) with question bank options.
* **High-Accuracy Offline OMR Engine (80–95%+ Accuracy)**:
  - **4 Corner Registration Markers**: Solid $24 \times 24\text{px}$ fiducial squares correct camera crop, shift ($\Delta x, \Delta y$), and scale ($s_x, s_y$).
  - **16-Point Radial Ring Contrast Auto-Centering ($\pm 14\text{px}$)**: Locks onto circle perimeters without false-positive border pulls.
  - **Adaptive Dual-Metric Fill Detection**: Eliminates ambient lighting and phone shadow false-positives.
* **DINA Cognitive Diagnosis & Question-by-Question Breakdown**:
  - Evaluates student skill profiles ($\boldsymbol{\alpha}$) on-device across the 12 Fractions Cognitive Attributes.
  - Generates detailed question-level cards displaying question prompt, chosen option, correct option, Right / Wrong / Not Attempted badge, and subtopic pills.
* **On-Device Q-Matrix Engine (`prajjwal1/bert-tiny`)**:
  - Auto-tags imported questions with cognitive attributes in pure TypeScript on the phone CPU (< 5 ms per question).
* **Offline Auto-Quiz Generator**:
  - Generates balanced mixed-concept and single-skill tests.
  - Exports printable Question Papers and standard OMR sheets via the Android Print Spooler.
* **Offline Auth & Storage**:
  - Salted SHA-256 password hashing (`expo-crypto`) and local storage (`AsyncStorage`).

---

## Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Start the Expo development server
npx expo start
```

---

## Building the Standalone Offline APK

Your `eas.json` is configured for generating direct standalone APK files for installation on any phone:

```bash
# Build standalone preview APK via EAS
npx eas build --profile preview --platform android

# Or build locally via Gradle
npx expo prebuild
cd android && ./gradlew assembleRelease
```

The compiled APK operates 100% in airplane mode with zero network requests.
