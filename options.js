document.addEventListener('DOMContentLoaded', restoreSettings);
document.getElementById('saveButton').addEventListener('click', saveSettings);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    restoreSettings();
  }
});

function noDrag(event) {
    event.preventDefault();
}
document.addEventListener('dragstart',noDrag,true);

function saveSettings() {
  const visibilitySettings = {
    bookmarksMenu: document.getElementById('bookmarksMenu').checked,
    bookmarksToolbar: document.getElementById('bookmarksToolbar').checked,
    otherBookmarks: document.getElementById('otherBookmarks').checked,
    mobileBookmarks: document.getElementById('mobileBookmarks').checked
  };

  const customCSS = document.getElementById('cssInput').value;

  browser.storage.sync.set({ 
    visibilitySettings,
    generalSettings: { 
      settingsChanged: true,
      customCSS: customCSS
    }
  });
}

function restoreSettings() {
  browser.storage.sync.get(['visibilitySettings', 'generalSettings']).then((data) => {
    const visibilitySettings = data.visibilitySettings || {
      bookmarksMenu: true,
      bookmarksToolbar: true,
      otherBookmarks: true,
      mobileBookmarks: true
    };

    document.getElementById('bookmarksMenu').checked = visibilitySettings.bookmarksMenu;
    document.getElementById('bookmarksToolbar').checked = visibilitySettings.bookmarksToolbar;
    document.getElementById('otherBookmarks').checked = visibilitySettings.otherBookmarks;
    document.getElementById('mobileBookmarks').checked = visibilitySettings.mobileBookmarks;

    if (data.generalSettings && data.generalSettings.customCSS) {
      document.getElementById('cssInput').value = data.generalSettings.customCSS;
    }

    // Add event listeners for checkboxes to save settings when clicked
    document.getElementById('bookmarksMenu').addEventListener('change', saveSettings);
    document.getElementById('bookmarksToolbar').addEventListener('change', saveSettings);
    document.getElementById('otherBookmarks').addEventListener('change', saveSettings);
    document.getElementById('mobileBookmarks').addEventListener('change', saveSettings);
  });
}

