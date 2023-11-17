// 清除初始的 chrome.tabs.onUpdated 和 chrome.tabs.onCreated 事件监听器
chrome.tabs.onUpdated.removeListener(handleEvent);
chrome.tabs.onCreated.removeListener(handleEvent);

// 添加 chrome.webNavigation.onBeforeNavigate 事件监听器
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  const tabId = details.tabId;
  const url = details.url;

  checkBlockedSite(url, tabId);
});

// 新的 checkBlockedSite 函数，用于检查并处理
function checkBlockedSite(url, tabId) {
  chrome.storage.sync.get(['blockedSites', 'redirectUrl'], function(result) {
    const blockedSites = result.blockedSites || [];
    const redirectUrl = result.redirectUrl || 'about:blank';

    if (blockedSites.some(site => url.includes(site))) {
      const absoluteRedirectUrl = chrome.runtime.getURL(redirectUrl);
      chrome.tabs.update(tabId, { url: absoluteRedirectUrl }, function() {
        console.log('Site redirected successfully.');
      });
    }
  });
}





// 在 popup.js 中添加编辑和删除功能
document.addEventListener('DOMContentLoaded', function() {
  const blockedList = document.getElementById('blockedList');

  // 更新列表
  function updateList() {
    chrome.storage.sync.get(['blockedSites'], function(result) {
      const blockedSites = result.blockedSites || [];

      blockedList.innerHTML = ''; // 清空列表

      blockedSites.forEach(function(site) {
        const listItem = document.createElement('li');
        listItem.textContent = site;

        // 添加编辑按钮
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', function() {
          const updatedSite = prompt('Enter updated site:', site);
          if (updatedSite !== null) {
            const index = blockedSites.indexOf(site);
            if (index !== -1) {
              blockedSites[index] = updatedSite;
              saveBlockedSites(blockedSites);
              updateList();
            }
          }
        });

        // 添加删除按钮
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
          const index = blockedSites.indexOf(site);
          if (index !== -1) {
            blockedSites.splice(index, 1);
            saveBlockedSites(blockedSites);
            updateList();
          }
        });

        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        blockedList.appendChild(listItem);
      });
    });
  }

  // 保存更新后的列表
  function saveBlockedSites(blockedSites) {
    chrome.storage.sync.set({ blockedSites: blockedSites });
  }

  // 初始化列表
  updateList();
});
