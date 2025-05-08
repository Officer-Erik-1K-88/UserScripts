// ==UserScript==
// @name         Movable Time Widget with GM Persistence
// @namespace    Violentmonkey Scripts
// @version      1.0
// @author       GPT
// @description  Movable, resizable clock widget with hover details and GM-persistent settings per domain and global fallback.
// @license      BSD 3-Clause
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==


(function () {
    'use strict';

    const DOMAIN = location.hostname;
    const GLOBAL_KEY = '__global__';
    const STORAGE_KEY = 'WidgetSettings';

    // === Helpers for GM Storage ===
    function getSettings() {
        const all = GM_getValue(STORAGE_KEY, {});
        return all[DOMAIN] || all[GLOBAL_KEY] || {};
    }

    function saveSettings(data) {
        const all = GM_getValue(STORAGE_KEY, {});
        all[DOMAIN] = data;
        GM_setValue(STORAGE_KEY, all);
    }

    function saveGlobalSettings(data) {
        const all = GM_getValue(STORAGE_KEY, {});
        all[GLOBAL_KEY] = data;
        GM_setValue(STORAGE_KEY, all);
    }

    const saved = getSettings();

    // === Create Widget ===
    const widget = document.createElement('div');
    widget.id = 'time-widget';
    widget.innerHTML = `
        <div class="time-main"></div>
        <div class="time-extra"></div>
        <div class="time-options">
            <label>
                <input type="checkbox" id="formatToggle">
                24-Hour Time
            </label><br>
            <button id="makeGlobal">Make Global Default</button>
        </div>
        <div class="resizer"></div>
    `;
    document.body.appendChild(widget);

    // === Styles ===
    const style = document.createElement('style');
    style.textContent = `
        #time-widget {
            position: fixed;
            top: 100px;
            left: 100px;
            width: 180px;
            min-width: 150px;
            min-height: 60px;
            background: rgba(30, 30, 30, 0.9);
            color: white;
            font-family: sans-serif;
            font-size: 14px;
            padding: 8px;
            border-radius: 6px;
            z-index: 99999;
            user-select: none;
            box-sizing: border-box;
            overflow: hidden;
        }
        .time-main {
            font-size: 18px;
            font-weight: bold;
        }
        .time-extra, .time-options {
            display: none;
            margin-top: 4px;
        }
        #time-widget:hover .time-extra,
        #time-widget:hover .time-options {
            display: block;
        }
        #time-widget .resizer {
            width: 10px;
            height: 10px;
            background: white;
            position: absolute;
            right: 0;
            bottom: 0;
            cursor: se-resize;
        }
        #time-widget button {
            margin-top: 4px;
            font-size: 12px;
        }
    `;
    document.head.appendChild(style);

    // === Functionality ===
    let use24Hour = saved.use24Hour || false;
    const formatToggle = widget.querySelector('#formatToggle');
    const timeMain = widget.querySelector('.time-main');
    const timeExtra = widget.querySelector('.time-extra');

    formatToggle.checked = use24Hour;
    formatToggle.addEventListener('change', () => {
        use24Hour = formatToggle.checked;
        persist();
        updateTime();
    });

    widget.querySelector('#makeGlobal').addEventListener('click', () => {
        saveGlobalSettings({
            top: widget.style.top,
            left: widget.style.left,
            width: widget.style.width,
            height: widget.style.height,
            use24Hour
        });
        alert('Current settings saved as global default.');
    });

    function pad(n) {
        return n < 10 ? '0' + n : n;
    }

    function updateTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = pad(now.getMinutes());
        const seconds = pad(now.getSeconds());
        let ampm = '';

        if (!use24Hour) {
            ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
        }

        const monthIndex = now.getMonth();
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const weekdays = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];

        const timeString = `${pad(hours)}:${minutes} ${use24Hour ? '' : ampm}`;
        const dateString = `
            <div>Seconds: ${seconds}</div>
            <div>Month: ${monthIndex + 1} (${months[monthIndex]})</div>
            <div>Day: ${now.getDate()}, ${now.getFullYear()}</div>
            <div>Weekday: ${weekdays[now.getDay()]}</div>
        `;

        timeMain.textContent = timeString.trim();
        timeExtra.innerHTML = dateString.trim();
    }

    setInterval(updateTime, 1000);
    updateTime();

    // === Apply Stored Position/Size ===
    if (saved.top) widget.style.top = saved.top;
    if (saved.left) widget.style.left = saved.left;
    if (saved.width) widget.style.width = saved.width;
    if (saved.height) widget.style.height = saved.height;

    function persist() {
        saveSettings({
            top: widget.style.top,
            left: widget.style.left,
            width: widget.style.width,
            height: widget.style.height,
            use24Hour
        });
    }

    // === Draggable ===
    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    widget.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resizer') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
        isDragging = true;
        offsetX = e.clientX - widget.offsetLeft;
        offsetY = e.clientY - widget.offsetTop;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            widget.style.left = `${e.clientX - offsetX}px`;
            widget.style.top = `${e.clientY - offsetY}px`;
            persist();
        }
    });

    document.addEventListener('mouseup', () => isDragging = false);

    // === Resizable ===
    const resizer = widget.querySelector('.resizer');
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            widget.style.width = `${e.clientX - widget.offsetLeft}px`;
            widget.style.height = `${e.clientY - widget.offsetTop}px`;
            persist();
        }
    });

    document.addEventListener('mouseup', () => isResizing = false);
})();