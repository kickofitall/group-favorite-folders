# Group Favorite Folders

## An extension for Thunderbird that groups and sorts favorites folders in the compact view.

**The plugin only affects the favorites folders with the compact view (flat, no hierarchy).**

[https://addons.thunderbird.net/thunderbird/addon/group-favorite-folders/](https://addons.thunderbird.net/thunderbird/addon/group-favorite-folders/)

Tested on Windows 10 x64 with Thunderbird (64-Bit):
- 115.3.2
- 115.10.1
- 128.1.0
- 136.0

I really liked the favorite folders up to Thunderbird before Supernova.
They were reduced, grouped and clear. No superfluous text. They met exactly
my needs for my daily work. With Thunderbird 115 and newer - aka Supernova - 
the display of the favorites has changed significantly.
This plugin is intended to provide a basis for restoring the look and feel
of the old favorites folders.

The plugin does the following:
- group favorites by type (Inbox, Sent, Junk, Virtual, etc.)
- sort folders in a group by account order or alphabetically
- remove *unnecessary* information

The *unnecessary* information that are removed:

Since each root folder has its own icon, there ist no need for any additional
names to tell them apart. So the plugin remove "Inbox", "Junk", etc. and only
show the account. For subfolders and feeds, the naming is "folder name - email account"
or "feed name - Feeds". Since I haven't favorited any directories that have the
same name in multiple accounts, I don't need the account information here.
The same goes for my feeds. I group them, see what they are called, the "Feeds"
appendix is unnecessary.

![screenshot of sorted favorites in compact view](/screenshots/sorted_favorites_in_compact_view.png)

The current order of the groups is as follows:
1. inbox 
1. outbox 
1. sent 
1. drafts
1. templates
1. junk 
1. trash 
1. archive
1. virtual 
1. folders
1. feeds

Inspired by [Manually Sort Folders](https://github.com/protz/Manually-Sort-Folders),
this plugin meets very specific needs that may only apply to a few. Therefore,
the plugin in its current form is intended as a basis for customizing it yourself.
There are no options at the moment, but the source code is commented in detail.

Feel free to contribute to this project.