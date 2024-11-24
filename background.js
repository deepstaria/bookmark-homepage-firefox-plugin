browser.runtime.onInstalled.addListener(function() {
  console.log('Bookmark Homepage extension installed.');
  browser.storage.sync.set({
    visibilitySettings: {
      bookmarksMenu: true,
      bookmarksToolbar: true,
      otherBookmarks: true,
      mobileBookmarks: true
    },
    generalSettings: {
      settingsChanged: true,
      customCSS: "" 
    }
  });
});
