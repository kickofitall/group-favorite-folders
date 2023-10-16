var {ExtensionCommon} = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var {MailServices} = ChromeUtils.import("resource:///modules/MailServices.jsm");

function get3PaneWindowInstance(nativeTab) {
    return (nativeTab.mode && nativeTab.mode.name === "mail3PaneTab")
        ? nativeTab.chromeBrowser.contentWindow
        : null;
}

function reloadFolders(folderPane) {
    for (let mode of Object.values(folderPane._modes)) {

        if (!mode.active)
            continue;

        mode.containerList.replaceChildren();
        folderPane._initMode(mode);
    }
}

async function install(window) {

    for (let i = 0; i < 20; i++) {

        if (window.folderPane && window.folderPane._initialized)
            break;

        await new Promise(r => window.setTimeout(r, 125))
    }

    if (!window.folderPane)
        return;

    // backup the original function ...
    window.folderPane._modes.favorite.groupFavoriteFoldersBackupOf_addFolder = window.folderPane._modes.favorite._addFolder;

    // ... and overwrite it
    window.folderPane._modes.favorite._addFolder = function (folder) {

        if (!this._favoriteFilter(folder) || window.folderPane.getRowForFolder(folder, this.name))
            return;

        if (window.folderPane._isCompact) {
            // start custom sorting
            customInsertInServerOrder(this.containerList, window.folderPane._createFolderRow(this.name, folder, "both"));
            return;
        }

        window.folderPane._addFolderAndAncestors(this.containerList, folder, this.name);
    };

    console.log("group_favorite_folders: patched _addFolder(), trigger reload")
    reloadFolders(window.folderPane);
}

function customInsertInServerOrder(list, serverRow) {

    // that is the sorting of the accounts
    let serverKeys = MailServices.accounts.accounts.map(
        a => a.incomingServer.key
    );

    // language-sensitive string comparison for alphabetical sorting
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
    const nameCollator = new Intl.Collator(undefined, { sensitivity: "base" });

    /*
        except for subfolders and feeds, every root folder has a type
        so let's replace 'undefined' with "folder" and "feed" to match them later in the group order
     */
    if (typeof serverRow.dataset.folderType === 'undefined') {

        if (serverRow.attributes[0].ownerElement._serverName.toLowerCase() === 'feeds')
            serverRow.dataset.folderType = 'feed';
        else
            serverRow.dataset.folderType = 'folder';

        /*
            I liked the stripped down style of the favorites before Supernova.
            So let's get rid of some redundant information.
            Default naming here is [folder name] - [email account] or [feed name] - "Feeds".
            Since I haven't favorited any directories that have the same name
            in multiple accounts, I don't need the account information here.
            The same goes for my feeds. I group them, see what they are called,
            the "Feeds" appendix is unnecessary.
         */
        let folderNameWithAccount = serverRow.getElementsByClassName("name")[0].innerText;

        // get rid of [email account] or "Feeds" and show only the folder/feed name
        serverRow.getElementsByClassName("name")[0].innerText = folderNameWithAccount.split(' - ', 1)[0];
    }
    /*
        Since each root folder has its own icon, I don't need any additional names to tell them apart.
        So we remove "Inbox", "Junk", etc. and only show the account, but not the label from virtual folders.
        Feel free to exclude more root folders.
        https://searchfox.org/comm-central/source/mailnews/base/src/FolderUtils.jsm#33
        Inbox, Trash, Outbox, Sent, Drafts, Templates, Junk, Archive, Virtual
     */
    else if (['virtual'].indexOf(serverRow.dataset.folderType) < 0) {
        let folderTypeWithAccount = serverRow.getElementsByClassName("name")[0].innerText;
        serverRow.getElementsByClassName("name")[0].innerText = folderTypeWithAccount.split(' - ', 2)[1];
    }

    // this is the order of my grouped folders
    const groupOrder = ['inbox', 'outbox', 'sent', 'drafts', 'templates', 'junk', 'trash', 'archive', 'virtual', 'folder', 'feed'];

    // these folders should be sorted like the accounts, all others alphabetically
    const sortByServerKey = ['inbox', 'outbox', 'sent', 'drafts', 'templates', 'junk', 'trash', 'archive'];

    // rank of the new entry in the order of accounts
    let indexRowToInsert = serverKeys.indexOf(serverRow.dataset.serverKey);

    /*
        Sorting:
        If any comparison results in the new entry being able to be inserted before an
        existing one, it is inserted and the loop ends.
        Otherwise it will just be appended to the end of the list when the loop is finished.
     */
    for (let row of list.children) {

        // rank of the entry in the loop in the order of the accounts.
        let indexLoopRow = serverKeys.indexOf(row.dataset.serverKey);

        // same type, sort within group
        if (row.dataset.folderType === serverRow.dataset.folderType) {

            // sort like the order of the accounts
            if (sortByServerKey.indexOf(row.dataset.folderType) >= 0) {

                if (indexLoopRow > indexRowToInsert)
                    return list.insertBefore(serverRow, row);
            }
            // sort alphabetically
            else {

                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/compare#return_value
                if (nameCollator.compare(row.name, serverRow.name) > 0)
                    return list.insertBefore(serverRow, row);
            }
        }
        // different type, move to the group
        else {
            let groupOrderIndexRowToInsert = groupOrder.indexOf(serverRow.dataset.folderType);
            let groupOrderIndexLoopRow = groupOrder.indexOf(row.dataset.folderType);

            if (groupOrderIndexLoopRow > groupOrderIndexRowToInsert)
                return list.insertBefore(serverRow, row);
        }
    }
    return list.appendChild(serverRow);
}

async function uninstall(window) {
    for (let i = 0; i < 20; i++) {

        if (window.folderPane && window.folderPane._initialized)
            break;

        await new Promise(r => window.setTimeout(r, 125))
    }

    if (!window.folderPane || !window.folderPane._modes.favorite.groupFavoriteFoldersBackupOf_addFolder)
        return;

    // restore original function
    window.folderPane._modes.favorite._addFolder = window.folderPane._modes.favorite.groupFavoriteFoldersBackupOf_addFolder;
    delete window.folderPane._modes.favorite.groupFavoriteFoldersBackupOf_addFolder;

    console.log("group_favorite_folders: restored _addFolder(), trigger reload")
    reloadFolders(window.folderPane);
}

var CustomFolderGroup = class extends ExtensionCommon.ExtensionAPI {
    getAPI(context) {
        return {
            CustomFolderGroup: {
                async patch(tabId) {
                    let {nativeTab} = context.extension.tabManager.get(tabId);
                    let windowInstance = get3PaneWindowInstance(nativeTab);
                    if (windowInstance) {
                        install(windowInstance);
                    }
                },
                async update(tabId) {
                    let {nativeTab} = context.extension.tabManager.get(tabId);
                    let windowInstance = get3PaneWindowInstance(nativeTab);
                    if (windowInstance) {
                        uninstall(windowInstance);
                        install(windowInstance);
                    }
                },
            },
        };
    }

    onShutdown(isAppShutdown) {
        if (isAppShutdown)
            return;

        for (let window of Services.wm.getEnumerator("mail:3pane")) {
            for (let nativeTab of window.gTabmail.tabInfo) {
                let windowInstance = get3PaneWindowInstance(nativeTab);
                if (windowInstance) {
                    uninstall(windowInstance);
                }
            }
        }
    }
};
