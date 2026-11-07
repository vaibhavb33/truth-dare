# Multilingual PWA Promotion Translations Matrix
**Module:** `lib/i18n/pwaPromotionTranslations.ts`  
**Supported Languages:** 8 Languages (English, Hindi, Spanish, Portuguese, French, Indonesian, Arabic, German)  
**Layout Directions:** LTR (7 languages), RTL (Arabic)  

---

## 1. Master Localization Table

| Key | English (`en`) | Hindi (`hi`) | Spanish (`es`) | Portuguese (`pt`) |
| :--- | :--- | :--- | :--- | :--- |
| **`badge`** | 🚀 Love our website? | 🚀 क्या आपको हमारी वेबसाइट पसंद है? | 🚀 ¿Te encanta nuestra web? | 🚀 Adora nosso site? |
| **`headline`** | Add it to your home screen! | इसे अपनी होम स्क्रीन पर जोड़ें! | ¡Añádela a tu pantalla de inicio! | Adicione à sua tela inicial! |
| **`description`** | Get quick access to Truth or Dare, Spinner and all your favourite games. | ट्रुथ या डेयर, स्पिनर और अपने सभी पसंदीदा खेलों तक तुरंत पहुंचें। | Accede al instante a Verdad o Reto, la Ruleta y todos tus juegos favoritos. | Tenha acesso rápido a Verdade ou Desafio, Roleta e todos os seus jogos favoritos. |
| **`primaryButton`** | Add to Home Screen | होम स्क्रीन पर जोड़ें | Añadir a pantalla de inicio | Adicionar à Tela Inicial |
| **`secondaryButton`**| Maybe Later | शायद बाद में | Quizás más tarde | Talvez mais tarde |
| **`closeAria`** | Close promotion | प्रचार बंद करें | Cerrar promoción | Fechar promoção |
| **`installedNotice`**| Asteria is already installed on your device. | एस्टरिया पहले से ही आपके डिवाइस पर इंस्टॉल है। | Asteria ya está instalada en tu dispositivo. | O Asteria já está instalado no seu dispositivo. |
| **`iosModalTitle`** | Install Asteria on iOS | iOS पर एस्टरिया इंस्टॉल करें | Instalar Asteria en iOS | Instalar Asteria no iOS |
| **`iosStep1Title`** | Tap the Safari Share button | सफारी शेयर बटन पर टैप करें | Toca el botón Compartir de Safari | Toque no botão Compartilhar do Safari |
| **`iosStep2Title`** | Choose "Add to Home Screen" | "होम स्क्रीन में जोड़ें" चुनें | Elige "Añadir a pantalla de inicio" | Selecione "Adicionar à Tela de Início" |
| **`iosStep3Title`** | Tap "Add" in Top-Right | ऊपर-दाएं कोने में "जोड़ें" पर टैप करें | Toca "Añadir" arriba a la derecha | Toque em "Adicionar" no canto superior direito |

---

## 2. Master Localization Table (Continued)

| Key | French (`fr`) | Indonesian (`id`) | Arabic (`ar` - RTL) | German (`de`) |
| :--- | :--- | :--- | :--- | :--- |
| **`badge`** | 🚀 Vous aimez notre site ? | 🚀 Suka situs web kami? | 🚀 هل أعجبك موقعنا؟ | 🚀 Gefällt dir unsere Website? |
| **`headline`** | Ajoutez-le à votre écran d'accueil ! | Tambahkan ke layar utama Anda! | أضفه إلى شاشتك الرئيسية! | Zum Startbildschirm hinzufügen! |
| **`description`** | Accédez rapidement à Action ou Vérité, la Roue et tous vos jeux préférés. | Dapatkan akses cepat ke Truth or Dare, Spinner, dan semua game favorit Anda. | احصل على وصول سريع إلى لعبة صراحة أو تحدي وعجلة التدوير وجميع ألعابك المفضلة. | Erhalte schnellen Zugriff auf Wahrheit oder Pflicht, Flaschendrehen und all deine Lieblingsspiele. |
| **`primaryButton`** | Ajouter à l'écran d'accueil | Tambah ke Layar Utama | إضافة إلى الشاشة الرئيسية | Zum Startbildschirm hinzufügen |
| **`secondaryButton`**| Peut-être plus tard | Mungkin Nanti | ربما لاحقاً | Vielleicht später |
| **`closeAria`** | Fermer la promotion | Tutup promosi | إغلاق العرض | Aktion schließen |
| **`installedNotice`**| Asteria est déjà installé sur votre appareil. | Asteria sudah terpasang di perangkat Anda. | أستيريا مثبت بالفعل على هذا الجهاز. | Asteria ist bereits auf diesem Gerät installiert. |
| **`iosModalTitle`** | Installer Asteria sur iOS | Pasang Asteria di iOS | تثبيت أستيريا على نظام iOS | Asteria auf iOS installieren |
| **`iosStep1Title`** | Appuyez sur le bouton Partager de Safari | Ketuk tombol Bagikan Safari | اضغط على زر المشاركة في Safari | Tippe auf den Safari-Teilen-Button |
| **`iosStep2Title`** | Sélectionnez "Sur l'écran d'accueil" | Pilih "Tambah ke Layar Utama" | اختر "إضافة إلى الشاشة الرئيسية" | Wähle "Zum Home-Bildschirm" |
| **`iosStep3Title`** | Appuyez sur "Ajouter" en haut à droite | Ketuk "Tambah" di Kanan Atas | اضغط على "إضافة" في أعلى اليمين | Tippe oben rechts auf "Hinzufügen" |

---

## 3. RTL Implementation for Arabic

When `locale === 'ar'`:
- Layout assigns `dir="rtl"`.
- Close button moves to `left-4`.
- Text aligns to the right side of the card.
- Icon badge aligns gracefully on the right edge.
- Verified in automated visual regression testing (`promotion-banner-arabic-rtl.png`).
