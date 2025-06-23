document.addEventListener('DOMContentLoaded', function() {
  // Setze das aktuelle Jahr im Footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  
  /* ------------------------------
     Cookie Consent & Settings
     ------------------------------ */
  const cookieConsent = document.getElementById('cookieConsent');
  const cookieSettingsModal = document.getElementById('cookieSettingsModal');
  
  const acceptAllCookiesBtn = document.getElementById('acceptAllCookies');
  const openCookieSettingsBtn = document.getElementById('openCookieSettings');
  const saveCookieSettingsBtn = document.getElementById('saveCookieSettings');
  const cancelCookieSettingsBtn = document.getElementById('cancelCookieSettings');
  
  // Checkbox-Elemente in der Einstellungen-Modal
  const performanceCookiesCheckbox = document.getElementById('performanceCookies');
  const functionalityCookiesCheckbox = document.getElementById('functionalityCookies');
  const advertisingCookiesCheckbox = document.getElementById('advertisingCookies');
  
  // Überprüfen, ob Cookie-Präferenzen bereits existieren
  const cookiePrefs = localStorage.getItem('cookiePreferences');
  if (cookiePrefs) {
    cookieConsent.style.display = 'none';
  } else {
    cookieConsent.style.display = 'flex';
  }
  
  // "Accept All" setzt alle optionalen Cookies
  acceptAllCookiesBtn.addEventListener('click', function() {
    const prefs = {
      performanceCookies: true,
      functionalityCookies: true,
      advertisingCookies: true
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    cookieConsent.style.display = 'none';
    // Starte die Datenerfassung, wenn Performance-Cookies erlaubt sind
    if (prefs.performanceCookies) {
      initDataCollection();
    }
  });
  
  // Öffne das Cookie-Einstellungen-Modal
  openCookieSettingsBtn.addEventListener('click', function() {
    cookieSettingsModal.style.display = 'flex';
    if (cookiePrefs) {
      try {
        const prefsObj = JSON.parse(cookiePrefs);
        performanceCookiesCheckbox.checked = prefsObj.performanceCookies;
        functionalityCookiesCheckbox.checked = prefsObj.functionalityCookies;
        advertisingCookiesCheckbox.checked = prefsObj.advertisingCookies;
      } catch (e) {
        performanceCookiesCheckbox.checked = false;
        functionalityCookiesCheckbox.checked = false;
        advertisingCookiesCheckbox.checked = false;
      }
    }
  });
  
  // Speichere Cookie-Einstellungen
  saveCookieSettingsBtn.addEventListener('click', function() {
    const prefs = {
      performanceCookies: performanceCookiesCheckbox.checked,
      functionalityCookies: functionalityCookiesCheckbox.checked,
      advertisingCookies: advertisingCookiesCheckbox.checked
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    cookieSettingsModal.style.display = 'none';
    cookieConsent.style.display = 'none';
    // Starte die Datenerfassung, wenn Performance-Cookies erlaubt sind
    if (prefs.performanceCookies) {
      initDataCollection();
    }
  });
  
  // Schließe das Modal ohne Änderungen
  cancelCookieSettingsBtn.addEventListener('click', function() {
    cookieSettingsModal.style.display = 'none';
  });
  
  /* ------------------------------
     Datenerfassung (Analytics)
     ------------------------------ */
  function initDataCollection() {
    console.log("Performance-Cookies erlaubt – Starte Datenerfassung");
    
    // Erfasse einen Page-View
    logEvent({
      event: "page_view",
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // Beispiel: Erfasse Klick-Ereignisse
    document.addEventListener('click', function(e) {
      const target = e.target;
      logEvent({
        event: "click",
        element: target.tagName,
        id: target.id,
        classes: target.className,
        timestamp: new Date().toISOString()
      });
    });
  }
  
  // Funktion, um Ereignisdaten an den Server zu senden
  function logEvent(eventData) {
    fetch('/log-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    })
    .then(response => {
      if (!response.ok) {
        console.error('Logging failed:', response.statusText);
      }
    })
    .catch(error => console.error('Error logging event:', error));
  }
  
  // Falls bereits Cookie-Präferenzen existieren, starte die Datenerfassung
  if (cookiePrefs) {
    try {
      const prefsObj = JSON.parse(cookiePrefs);
      if (prefsObj.performanceCookies) {
        initDataCollection();
      }
    } catch (e) {
      console.error("Fehler beim Parsen der Cookie-Präferenzen:", e);
    }
  }
});
