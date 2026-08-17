import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PWA_INSTALLED_KEY = 'shemsou_pwa_installed';

export default function InstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hide if already running as installed app (any platform)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Hide only for THIS browser/device that already installed it (per-browser flag)
    if (localStorage.getItem(PWA_INSTALLED_KEY) === '1') return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    const onAppInstalled = () => {
      localStorage.setItem(PWA_INSTALLED_KEY, '1');
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem(PWA_INSTALLED_KEY, '1');
      }
    } catch (e) {
      // ignore
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className="pwa-install-btn"
      onClick={handleInstall}
      aria-label={t.installApp}
    >
      <Download size={16} />
      <span>{t.installApp}</span>
    </button>
  );
}
