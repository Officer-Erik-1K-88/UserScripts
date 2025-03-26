// ==UserScript==
// @name         YouTube Sidebar Info with Wide Related & Playlist Under Player
// @namespace    ViolentMonkey.YTLayoutMod
// @version      5.0
// @description  Moves metadata/comments to a fixed right sidebar and repositions related/playlist below player with player-matching width (not narrow). Works even on SPA navigation (YouTube dynamic loading). Matches YT's look with wide layout preserved. NOTICE: THIS SCRIPT IS BUGGY AND DOESN'T WORK RIGHT.
// @license      BSD 3-Clause
// @author       ChatGPT
// @match        https://www.youtube.com/watch*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

const addStyle = () => {
    const style = document.createElement('style');
    style.textContent = `
        #custom-sidebar {
            position: fixed;
            top: 56px;
            right: 0;
            width: 400px;
            max-height: calc(100vh - 56px);
            overflow-y: auto;
            background: var(--yt-spec-brand-background-primary);
            box-shadow: -2px 0 8px rgba(0,0,0,0.2);
            z-index: 1000;
            padding: 16px;
            box-sizing: border-box;
        }

        #custom-sidebar ytd-watch-metadata,
        #custom-sidebar ytd-comments {
            margin-bottom: 16px;
        }

        .moved-under-player {
            max-width: none !important;
            width: 100% !important;
            box-sizing: border-box;
            margin-top: 16px;
        }
    `;
    document.head.appendChild(style);
};


    const moveElements = () => {
        const metadata = document.querySelector('ytd-watch-metadata');
        const comments = document.querySelector('ytd-comments');
        const related = document.getElementById('related');
        const playlist = document.querySelector('ytd-playlist-panel-renderer');
        const primaryInner = document.querySelector('#primary-inner');

        if (!metadata || !comments || !related || !primaryInner) {
            setTimeout(moveElements, 500); // Retry until everything loads
            return;
        }

        // Create the fixed sidebar if not present
        let sidebar = document.getElementById('custom-sidebar');
        if (!sidebar) {
            sidebar = document.createElement('div');
            sidebar.id = 'custom-sidebar';
            document.body.appendChild(sidebar);
        }

        // Move metadata to sidebar
        if (metadata.parentElement !== sidebar) sidebar.appendChild(metadata);

        // Move related under the player
        if (related.parentElement !== primaryInner) {
            primaryInner.appendChild(related);
        }
        related.classList.add('moved-under-player');

        // Move playlist under the player if it exists
        if (playlist && playlist.parentElement !== primaryInner) {
            primaryInner.appendChild(playlist);
            playlist.classList.add('moved-under-player');
        }

		// Move comments to sidebar
		const addComments = () => {
			// Only move comments once they are loaded
    		const commentsLoaded = comments.querySelector('ytd-comment-thread-renderer');
    		if (!commentsLoaded) {
        		setTimeout(addComments, 500); // Retry again later
        		return;
    		}
			if (comments.parentElement !== sidebar) sidebar.appendChild(comments);
		};
		comments.style.display = "none";
    };

    const waitForPageReady = () => {
        const observer = new MutationObserver(() => {
            moveElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    addStyle();
    moveElements();
    waitForPageReady();
})();