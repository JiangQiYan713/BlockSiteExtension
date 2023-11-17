document.addEventListener('DOMContentLoaded', function() {
  const blockedList = document.getElementById('blockedList');
  const siteInput = document.getElementById('site');
  const blockButton = document.getElementById('blockButton');
  const redirectUrlInput = document.getElementById('redirectUrl');
  const saveRedirectButton = document.getElementById('saveRedirect');
  const exportButton = document.getElementById('exportButton');
  const importButton = document.getElementById('importButton');

  // 更新列表
  function updateList() {
    chrome.storage.sync.get(['blockedSites', 'redirectUrl'], function(result) {
      const blockedSites = result.blockedSites || [];
      const redirectUrl = result.redirectUrl || 'about:blank';

      // 按首字母排序
      blockedSites.sort((a, b) => a.localeCompare(b));

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

      // 更新 Redirect Settings 下的当前设置
      redirectUrlInput.value = redirectUrl;

      // 更新当前的重定向 URL
      const currentRedirectUrlSpan = document.getElementById('currentRedirectUrl');
      currentRedirectUrlSpan.textContent = redirectUrl;
    });
  }

  // 保存更新后的列表
  function saveBlockedSites(blockedSites) {
    chrome.storage.sync.set({ blockedSites: blockedSites });
  }

  // 初始化列表
  updateList();

  // 监听“Block”按钮点击事件
  blockButton.addEventListener('click', function() {
    const site = siteInput.value;
    if (site.trim() !== '') {
      chrome.storage.sync.get(['blockedSites'], function(result) {
        const blockedSites = result.blockedSites || [];

        // 检查重复域名并删除重复项
        if (!blockedSites.includes(site)) {
          blockedSites.push(site);
          saveBlockedSites(blockedSites);
          updateList();
        }
      });
    }
  });

  // 监听“Save Redirect”按钮点击事件
  saveRedirectButton.addEventListener('click', function() {
    const redirectUrl = redirectUrlInput.value;
    chrome.storage.sync.set({ redirectUrl: redirectUrl });
    updateList();
  });

  // 监听“Export”按钮点击事件
  exportButton.addEventListener('click', function() {
    chrome.storage.sync.get(['blockedSites'], function(result) {
      const blockedSites = result.blockedSites || [];
      const exportData = blockedSites.join('\n');
      const blob = new Blob([exportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blocked_sites.jqy';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  // 监听“Import”按钮点击事件
  importButton.addEventListener('click', function() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.jqy';
    fileInput.addEventListener('change', function() {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const importedData = e.target.result;
          const importedSites = importedData.split('\n').map(site => site.trim()).filter(site => site !== '');

          // 检查重复域名并添加到列表
          chrome.storage.sync.get(['blockedSites'], function(result) {
            const blockedSites = result.blockedSites || [];
            const uniqueImportedSites = importedSites.filter(site => !blockedSites.includes(site));
            const updatedBlockedSites = [...blockedSites, ...uniqueImportedSites];

            // 按首字母排序
            updatedBlockedSites.sort((a, b) => a.localeCompare(b));

            saveBlockedSites(updatedBlockedSites);
            updateList();
          });
        };
        reader.readAsText(file);
      }
    });
    fileInput.click();
  });
});
