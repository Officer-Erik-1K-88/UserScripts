// ==UserScript==
// @name         HIDIVE Hide Video Scrollbar
// @namespace    Violentmonkey Scripts
// @version      1.0
// @description  Hide the scrollbar on HIDIVE video pages but keep scrolling functionality
// @author       Officer Erik 1K-88
// @match        https://www.hidive.com/video/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // Inject CSS to hide the scrollbar but still allow scrolling
    const style = document.createElement('style');
    style.textContent = `
        /* Hide scrollbar for all elements */
        ::-webkit-scrollbar {
            width: 0px;
            height: 0px;
        }
        html, body {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none;  /* IE 10+ */
        }
    `;
    document.documentElement.appendChild(style);
})();