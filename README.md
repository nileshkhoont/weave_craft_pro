# TexMetrics Pro - Precision Textile & GSM Intelligence Suite

![TexMetrics Pro Logo](https://img.shields.io/badge/Brand-TexMetrics%20Pro-2563EB?style=for-the-badge)
![React Native](https://img.shields.io/badge/React%20Native-0.84.0-61DAFB?style=for-the-badge&logo=react)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-3DDC84?style=for-the-badge)

**TexMetrics Pro** is a modern, high-precision textile calculation and fabric analytics suite built for apparel manufacturers, fashion designers, textile mills, tailors, and fabric buyers.

---

## ✨ Features

- 📐 **Fabric GSM Calculator**: Calculate Grams per Square Meter ($g/m^2$) instantly from Weight ($g$), Length ($m$), and Width ($m$). Includes automatic textile classification (Ultra Light, Light, Medium, Heavy, Very Heavy).
- 💰 **Fabric Cost Estimator**: Calculate exact fabric costs per linear meter and per linear yard based on yarn/fabric price per kilogram.
- 🎨 **Neumorphic Visual Identity**: Sleek slate aesthetic with electric sapphire, emerald velvet, and amethyst silk accents.
- 📤 **Shareable Reports**: Instant formatted report generation for quick sharing with suppliers and team members.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Metro Bundler
```bash
npm start
```

### 3. Build & Run
- **Android**:
  ```bash
  npm run android
  ```
- **iOS** *(macOS only)*:
  ```bash
  cd ios && bundle exec pod install && cd ..
  npm run ios
  ```

---

## 📐 Key Formulas

| Calculator | Formula |
| :--- | :--- |
| **GSM** | $\text{GSM} = \frac{\text{Weight (g)}}{\text{Length (m)} \times \text{Width (m)}}$ |
| **Reverse Width** | $\text{Width} = \frac{\text{Weight (g)}}{\text{GSM} \times \text{Length (m)}}$ |
| **Cost per Meter** | $\text{Cost/m} = \frac{\text{GSM} \times \text{Width (m)} \times \text{Price/kg}}{1000}$ |
| **Cost per Yard** | $\text{Cost/yd} = \text{Cost/m} \times 0.9144$ |

---

## 🛡 License
Internal / Proprietary Software. All rights reserved.
