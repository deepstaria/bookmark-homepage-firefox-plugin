

function createBookmarkTree(bookmarks, parentElement, visibilitySettings, folderStates, folderCat = "F", folderCount = {count:0}) {
  //console.log('Creating bookmark tree for:', bookmarks);

  bookmarks.forEach((bookmark) => {
    if (bookmark.children) {
      /* set folder id prefix if not skipping */
      if (bookmark.title === "Bookmarks Menu") {
        if (!visibilitySettings.bookmarksMenu) {
          return;
        }
        folderCat = "FM";
        folderCount = {count:0}
      } else if (bookmark.title === "Bookmarks Toolbar") {
        if (!visibilitySettings.bookmarksToolbar) {
          return;
        }
        folderCat = "FT";
        folderCount = {count:0}
      } else if (bookmark.title === "Other Bookmarks") {
        if (!visibilitySettings.otherBookmarks) { 
          return;
        }
        folderCat = "FO";
        folderCount = {count:0}
      } else if (bookmark.title === "Mobile Bookmarks") {
        if (!visibilitySettings.mobileBookmarks) {
          return;
        }
        folderCat = "FM";
        folderCount = {count:0}
      } 

      // Recursively handle bookmark folders
      const folderItem = document.createElement('li');
      if (bookmark.title) {
        const folderToggle = document.createElement('input');
        folderToggle.type = 'checkbox';
        const folderId = folderCat + folderCount.count++;
        folderToggle.id = folderId;
        folderToggle.checked = folderStates[folderId] !== undefined ? folderStates[folderId] : true;
        //folderToggle.checked = true;

        // Add an onchange event to update folderStates
        folderToggle.addEventListener('change', () => {
          folderStates[folderId] = folderToggle.checked;
          browser.storage.sync.set({ folderStates }); // Persist the updated state
        });

        const folderLabel = document.createElement('label');
        folderLabel.className = 'folder_label';
        folderLabel.htmlFor = folderToggle.id;
        folderLabel.textContent = bookmark.title;

        folderItem.appendChild(folderToggle);
        folderItem.appendChild(folderLabel);
      }
      const childList = document.createElement('ul');
      folderItem.appendChild(childList);
      parentElement.appendChild(folderItem);
      createBookmarkTree(bookmark.children, bookmark.title ? childList : parentElement, visibilitySettings, folderStates, folderCat, folderCount);
    }
    else if (bookmark.url) {
      // Create a list item for each bookmark with a hyperlink
      const bookmarkItem = document.createElement('li');

      const bookmarkSpan = document.createElement('span');
      bookmarkSpan.className = 'bookmark_span';

      const link = document.createElement('a');
      link.href = bookmark.url;
      link.textContent = bookmark.title;
      link.target = "_blank";
      link.className = 'bookmark-content';

      // Create an icon for the bookmark
      const icon = document.createElement('img');
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}`;
      icon.src = faviconUrl;
      icon.alt = ""; 

      bookmarkSpan.appendChild(icon);
      bookmarkSpan.appendChild(link);

      // Batch history queries to improve efficiency
      browser.history.getVisits({ url: bookmark.url }).then(visits => {
        if (visits.length > 0) {
          const lastVisitTime = visits[visits.length - 1].visitTime;
          const date = new Date(lastVisitTime);
          const timestamp = document.createElement('span');
          timestamp.classList.add('timestamp');
          timestamp.textContent = `(Last visited: ${date.toLocaleString()})`;
          
          // Calculate opacity based on the number of days since the last visit
          const currentDate = new Date();
          const daysSinceVisit = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
          const opacity = Math.max(1 - (daysSinceVisit / 255), 0);
          timestamp.style.opacity = opacity;
          
          bookmarkSpan.appendChild(timestamp);
        }
      });

      bookmarkItem.appendChild(bookmarkSpan);
      parentElement.appendChild(bookmarkItem);
    }
  });
}

// Get bookmarks from the browser and display them
function loadBookmarks() {
  browser.storage.sync.get(['visibilitySettings', 'generalSettings', 'folderStates']).then(function(data) {
    browser.bookmarks.getTree().then(function(bookmarkTreeNodes) {
      const visibilitySettings = data.visibilitySettings || {
        bookmarksMenu: true,
        bookmarksToolbar: true,
        otherBookmarks: true,
        mobileBookmarks: true
      };

      const folderStates = data.folderStates || {};

      // console.log('Bookmark tree:', bookmarkTreeNodes);
      const bookmarkTree = document.getElementById('bookmarkTree');
      bookmarkTree.innerHTML = '';
      createBookmarkTree(bookmarkTreeNodes, bookmarkTree, visibilitySettings, folderStates);
      bookmarkTree.classList.add('tree');

      if (data.generalSettings && data.generalSettings.customCSS) {
        const styleElement = document.getElementById('customStyles');
        styleElement.textContent += data.generalSettings.customCSS;
      }

      data.generalSettings.settingsChanged = false;
      browser.storage.sync.set({
        generalSettings: data.generalSettings
      });
    });
  });
}

// Load bookmarks when page loaded, and visibility change
document.addEventListener('DOMContentLoaded', loadBookmarks);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    browser.storage.sync.get('generalSettings').then(function(data) {

      if (data.generalSettings && data.generalSettings.settingsChanged === true) {
        loadBookmarks();
      }
    });
  }
});