/* browser.tabs.onCreated.addListener(async tab => {
    if (tab.type === "mail") {
        browser.CustomFolderGroup.patch(tab.id);
    }
});

// handle already open tabs.
async function handleAlreadyOpenTabs() {
    let tabs = (await browser.tabs.query({})).filter(t => ["mail"].includes(t.type));

    for (let tab of tabs) {
        browser.CustomFolderGroup.patch(tab.id);
    }
}

await handleAlreadyOpenTabs();

*/

browser.tabs.onCreated.addListener(async tab => {
    console.log("group_favorite_folders: tab created, type:", tab.type, "id:", tab.id);
    if (tab.type === "mail") {
        browser.CustomFolderGroup.patch(tab.id);
    }
});

async function handleAlreadyOpenTabs() {
    let tabs = (await browser.tabs.query({})).filter(t => ["mail"].includes(t.type));
    console.log("group_favorite_folders: open mail tabs:", tabs.map(t => t.id));
    for (let tab of tabs) {
        browser.CustomFolderGroup.patch(tab.id);
    }
}

await handleAlreadyOpenTabs();
