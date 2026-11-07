import { Locale } from './config';

export interface PWAPromotionTranslation {
  badge: string;
  headline: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
  closeAria: string;
  installedNotice: string;
  iosModalTitle: string;
  iosStep1Title: string;
  iosStep1Desc: string;
  iosStep2Title: string;
  iosStep2Desc: string;
  iosStep3Title: string;
  iosStep3Desc: string;
  desktopHelpTitle: string;
  desktopHelpDesc: string;
  gotIt: string;
}

export const PWA_PROMOTION_TRANSLATIONS: Record<Locale, PWAPromotionTranslation> = {
  en: {
    badge: '🚀 Love our website?',
    headline: 'Add it to your home screen!',
    description: 'Get quick access to Truth or Dare, Spinner and all your favourite games.',
    primaryButton: 'Add to Home Screen',
    secondaryButton: 'Maybe Later',
    closeAria: 'Close promotion',
    installedNotice: 'Asteria is already installed on your device.',
    iosModalTitle: 'Install Asteria on iOS',
    iosStep1Title: 'Tap the Safari Share button',
    iosStep1Desc: 'Located at the bottom of your screen (or top on iPad).',
    iosStep2Title: 'Choose "Add to Home Screen"',
    iosStep2Desc: 'Scroll down in the sharing action menu to locate the option.',
    iosStep3Title: 'Tap "Add" in Top-Right',
    iosStep3Desc: 'Asteria will launch with zero browser bars like a native app.',
    desktopHelpTitle: 'Install Asteria App',
    desktopHelpDesc: 'Click the install icon in your browser address bar or press Ctrl+D (Cmd+D) to bookmark.',
    gotIt: 'Got It, Thanks!',
  },
  hi: {
    badge: '🚀 क्या आपको हमारी वेबसाइट पसंद है?',
    headline: 'इसे अपनी होम स्क्रीन पर जोड़ें!',
    description: 'ट्रुथ या डेयर, स्पिनर और अपने सभी पसंदीदा खेलों तक तुरंत पहुंचें।',
    primaryButton: 'होम स्क्रीन पर जोड़ें',
    secondaryButton: 'शायद बाद में',
    closeAria: 'प्रचार बंद करें',
    installedNotice: 'एस्टरिया पहले से ही आपके डिवाइस पर इंस्टॉल है।',
    iosModalTitle: 'iOS पर एस्टरिया इंस्टॉल करें',
    iosStep1Title: 'सफारी शेयर बटन पर टैप करें',
    iosStep1Desc: 'आपकी स्क्रीन के नीचे (या iPad पर ऊपर) स्थित है।',
    iosStep2Title: '"होम स्क्रीन में जोड़ें" चुनें',
    iosStep2Desc: 'विकल्प खोजने के लिए शेयरिंग मेनू में नीचे स्क्रॉल करें।',
    iosStep3Title: 'ऊपर-दाएं कोने में "जोड़ें" पर टैप करें',
    iosStep3Desc: 'एस्टरिया बिना ब्राउज़र बार के एक मूल ऐप की तरह खुलेगा।',
    desktopHelpTitle: 'एस्टरिया ऐप इंस्टॉल करें',
    desktopHelpDesc: 'अपने ब्राउज़र एड्रेस बार में इंस्टॉल आइकन पर क्लिक करें या बुकमार्क करने के लिए Ctrl+D (Cmd+D) दबाएं।',
    gotIt: 'समझ गया, धन्यवाद!',
  },
  es: {
    badge: '🚀 ¿Te encanta nuestra web?',
    headline: '¡Añádela a tu pantalla de inicio!',
    description: 'Accede al instante a Verdad o Reto, la Ruleta y todos tus juegos favoritos.',
    primaryButton: 'Añadir a pantalla de inicio',
    secondaryButton: 'Quizás más tarde',
    closeAria: 'Cerrar promoción',
    installedNotice: 'Asteria ya está instalada en tu dispositivo.',
    iosModalTitle: 'Instalar Asteria en iOS',
    iosStep1Title: 'Toca el botón Compartir de Safari',
    iosStep1Desc: 'Ubicado en la parte inferior de la pantalla (o arriba en iPad).',
    iosStep2Title: 'Elige "Añadir a pantalla de inicio"',
    iosStep2Desc: 'Desplázate hacia abajo en el menú de compartir para encontrar la opción.',
    iosStep3Title: 'Toca "Añadir" arriba a la derecha',
    iosStep3Desc: 'Asteria se abrirá como una aplicación nativa sin barras de navegador.',
    desktopHelpTitle: 'Instalar la aplicación Asteria',
    desktopHelpDesc: 'Haz clic en el icono de instalación en la barra de direcciones o presiona Ctrl+D (Cmd+D).',
    gotIt: '¡Entendido, gracias!',
  },
  pt: {
    badge: '🚀 Adora nosso site?',
    headline: 'Adicione à sua tela inicial!',
    description: 'Tenha acesso rápido a Verdade ou Desafio, Roleta e todos os seus jogos favoritos.',
    primaryButton: 'Adicionar à Tela Inicial',
    secondaryButton: 'Talvez mais tarde',
    closeAria: 'Fechar promoção',
    installedNotice: 'O Asteria já está instalado no seu dispositivo.',
    iosModalTitle: 'Instalar Asteria no iOS',
    iosStep1Title: 'Toque no botão Compartilhar do Safari',
    iosStep1Desc: 'Localizado na parte inferior da tela (ou na superior no iPad).',
    iosStep2Title: 'Selecione "Adicionar à Tela de Início"',
    iosStep2Desc: 'Role para baixo no menu de compartilhamento para localizar a opção.',
    iosStep3Title: 'Toque em "Adicionar" no canto superior direito',
    iosStep3Desc: 'O Asteria será iniciado sem barras de navegador como um app nativo.',
    desktopHelpTitle: 'Instalar aplicativo Asteria',
    desktopHelpDesc: 'Clique no ícone de instalação na barra de endereços ou pressione Ctrl+D (Cmd+D).',
    gotIt: 'Entendido, obrigado!',
  },
  fr: {
    badge: '🚀 Vous aimez notre site ?',
    headline: "Ajoutez-le à votre écran d'accueil !",
    description: 'Accédez rapidement à Action ou Vérité, la Roue et tous vos jeux préférés.',
    primaryButton: "Ajouter à l'écran d'accueil",
    secondaryButton: 'Peut-être plus tard',
    closeAria: 'Fermer la promotion',
    installedNotice: 'Asteria est déjà installé sur votre appareil.',
    iosModalTitle: 'Installer Asteria sur iOS',
    iosStep1Title: 'Appuyez sur le bouton Partager de Safari',
    iosStep1Desc: "Situé en bas de votre écran (ou en haut sur l'iPad).",
    iosStep2Title: 'Sélectionnez "Sur l\'écran d\'accueil"',
    iosStep2Desc: "Faites défiler le menu de partage pour trouver l'option.",
    iosStep3Title: 'Appuyez sur "Ajouter" en haut à droite',
    iosStep3Desc: 'Asteria se lancera comme une application native sans barre de navigation.',
    desktopHelpTitle: "Installer l'application Asteria",
    desktopHelpDesc: "Cliquez sur l'icône d'installation dans la barre d'adresse ou appuyez sur Ctrl+D (Cmd+D).",
    gotIt: 'Compris, merci !',
  },
  id: {
    badge: '🚀 Suka situs web kami?',
    headline: 'Tambahkan ke layar utama Anda!',
    description: 'Dapatkan akses cepat ke Truth or Dare, Spinner, dan semua game favorit Anda.',
    primaryButton: 'Tambah ke Layar Utama',
    secondaryButton: 'Mungkin Nanti',
    closeAria: 'Tutup promosi',
    installedNotice: 'Asteria sudah terpasang di perangkat Anda.',
    iosModalTitle: 'Pasang Asteria di iOS',
    iosStep1Title: 'Ketuk tombol Bagikan Safari',
    iosStep1Desc: 'Terletak di bagian bawah layar Anda (atau atas pada iPad).',
    iosStep2Title: 'Pilih "Tambah ke Layar Utama"',
    iosStep2Desc: 'Gulir ke bawah di menu bagikan untuk menemukan opsi.',
    iosStep3Title: 'Ketuk "Tambah" di Kanan Atas',
    iosStep3Desc: 'Asteria akan terbuka seperti aplikasi asli tanpa bilah browser.',
    desktopHelpTitle: 'Pasang Aplikasi Asteria',
    desktopHelpDesc: 'Klik ikon pasang di bilah alamat browser atau tekan Ctrl+D (Cmd+D) untuk menyimpan.',
    gotIt: 'Mengerti, Terima Kasih!',
  },
  ar: {
    badge: '🚀 هل أعجبك موقعنا؟',
    headline: 'أضفه إلى شاشتك الرئيسية!',
    description: 'احصل على وصول سريع إلى لعبة صراحة أو تحدي وعجلة التدوير وجميع ألعابك المفضلة.',
    primaryButton: 'إضافة إلى الشاشة الرئيسية',
    secondaryButton: 'ربما لاحقاً',
    closeAria: 'إغلاق العرض',
    installedNotice: 'أستيريا مثبت بالفعل على هذا الجهاز.',
    iosModalTitle: 'تثبيت أستيريا على نظام iOS',
    iosStep1Title: 'اضغط على زر المشاركة في Safari',
    iosStep1Desc: 'موجود في أسفل الشاشة (أو في الأعلى على iPad).',
    iosStep2Title: 'اختر "إضافة إلى الشاشة الرئيسية"',
    iosStep2Desc: 'مرر لأسفل في قائمة إجراءات المشاركة للعثور على الخيار.',
    iosStep3Title: 'اضغط على "إضافة" في أعلى اليمين',
    iosStep3Desc: 'سيتم تشغيل أستيريا بدون أشرطة المتصفح كتطبيق أصلي.',
    desktopHelpTitle: 'تثبيت تطبيق أستيريا',
    desktopHelpDesc: 'انقر على رمز التثبيت في شريط عنوان المتصفح أو اضغط Ctrl+D (Cmd+D) للحفظ.',
    gotIt: 'حسناً، شكراً!',
  },
  de: {
    badge: '🚀 Gefällt dir unsere Website?',
    headline: 'Zum Startbildschirm hinzufügen!',
    description: 'Erhalte schnellen Zugriff auf Wahrheit oder Pflicht, Flaschendrehen und all deine Lieblingsspiele.',
    primaryButton: 'Zum Startbildschirm hinzufügen',
    secondaryButton: 'Vielleicht später',
    closeAria: 'Aktion schließen',
    installedNotice: 'Asteria ist bereits auf diesem Gerät installiert.',
    iosModalTitle: 'Asteria auf iOS installieren',
    iosStep1Title: 'Tippe auf den Safari-Teilen-Button',
    iosStep1Desc: 'Befindet sich unten auf dem Bildschirm (oder oben auf dem iPad).',
    iosStep2Title: 'Wähle "Zum Home-Bildschirm"',
    iosStep2Desc: 'Scrolle im Teilen-Menü nach unten, um die Option zu finden.',
    iosStep3Title: 'Tippe oben rechts auf "Hinzufügen"',
    iosStep3Desc: 'Asteria startet ohne Browserleisten wie eine native App.',
    desktopHelpTitle: 'Asteria App installieren',
    desktopHelpDesc: 'Klicke auf das Installationssymbol in der Adressleiste oder drücke Strg+D (Cmd+D).',
    gotIt: 'Verstanden, danke!',
  },
};

export function getPWAPromotionTranslation(locale: Locale): PWAPromotionTranslation {
  return PWA_PROMOTION_TRANSLATIONS[locale] || PWA_PROMOTION_TRANSLATIONS.en;
}

