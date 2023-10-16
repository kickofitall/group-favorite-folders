async function init() {

    browser.tabs.onCreated.addListener(async tab => {
        browser.CustomFolderGroup.patch(tab.id);
    });

    // handle already open tabs.
    async function handleAlreadyOpenTabs() {
        let tabs = (await browser.tabs.query({})).filter(t => ["mail"].includes(t.type));

        for (let tab of tabs)
            browser.CustomFolderGroup.patch(tab.id);
    }

    handleAlreadyOpenTabs();
}

init();
