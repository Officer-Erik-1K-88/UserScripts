// Created on 3/26/2025, 10:02:12 AM GMT+0500 (CDT)
// ==UserScript==
// @name         HIDIVE Video Toggles
// @namespace    Violentmonkey Scripts
// @version      1.0
// @author       Officer Erik 1K-88
// @description  Currently we only have one toggle, it's for the HIDIVE subtitles being able to be switched between Off and English with the 'C' key.
// @match        https://www.hidive.com/video/*
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.info
// ==/UserScript==

(async function () {
    'use strict';

	const getVal = async (key, def) => {
        return await GM.getValue(key, def);
	};
	const setVal = async (key, value) => {
		return await GM.setValue(key, value);
	};

    /**
     * Formats a date object.
     * @param {Date} date The Date object.
     * @returns The formatted string.
     */
    function formatDate(date) {
        const pad = (n, width = 2) => String(n).padStart(width, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hour = pad(date.getHours());
        const minute = pad(date.getMinutes());
        const second = pad(date.getSeconds());
        const milliseconds = pad(date.getMilliseconds(), 3);

        // GMT offset in ±HHMM format
        const offsetMinutes = date.getTimezoneOffset();
        const absOffset = Math.abs(offsetMinutes);
        const offsetSign = offsetMinutes <= 0 ? '+' : '-';
        const offsetHours = pad(Math.floor(absOffset / 60));
        const offsetMins = pad(absOffset % 60);
        const gmtOffset = `GMT${offsetSign}${offsetHours}${offsetMins}`;

        // Time zone name (e.g., Eastern Daylight Time)
        const tzName = date.toString().match(/\(([^)]+)\)/)?.[1] || Intl.DateTimeFormat().resolvedOptions().timeZone;

        return `${year}-${month}-${day}  ${hour}:${minute}:${second}.${milliseconds}  (${gmtOffset} [${tzName}])`;
    }

    let subtitles = [];
    let selected = undefined;
    let currentLabel = "";
    var storedSelection = await getVal("selsub", "Subtitles Off");
    let subtitlesOff = undefined;
    let americanEnglish = undefined;
    let anyEnglish = undefined;
    const interval = 1000;
    const timeout = 10000;
    const information = {
        name: `${GM.info.script.name}'s Entry Checking`,
        timeElapsed: 0,
        logs: []
    };
    const logger = {
        message: (type, msg) => {
            information.logs.push({
                logType: type,
                message: msg,
                time: new Date(Date.now()).toTimeString()
            });
        },
        error: msg => {
            logger.message("error", msg);
        },
        warn: msg => {
            logger.message("warn", msg);
        },
        log: msg => {
            logger.message("log", msg);
        },
        counterNames: [],
        counterInfo: {},
        count: label => {
            if (!logger.counterNames.includes(label)) {
                const index = information.logs.length;
                logger.counterInfo[label] = index;
                logger.counterNames.push(label);
                logger.message("counter", {
                    label: label,
                    count: 0,
                    time: {
                        start: formatDate(new Date(Date.now())),
                        end: ""
                    }
                });
            }
            const countInfo = information.logs[logger.counterInfo[label]].message;
            countInfo.count += 1;
            countInfo.time.end = formatDate(new Date(Date.now()));
        }
    };

    /**
     * The function to be called when a key is pressed down.
     * @param {KeyboardEvent} e The keyboard event.
     * @returns
     */
    const onKeyDown = async (e) => {
        if (e.key.toLowerCase() === 'c') {
			selected = subtitles.find(el => el.classList.contains('preferences-panel__option--selected'));

			currentLabel = (selected ? selected.getAttribute('aria-label') || '' : '');

			if (currentLabel !== 'Subtitles Off') {
				// If it's not already off, turn it off
				if (subtitlesOff) subtitlesOff.click();
				storedSelection = "Subtitles Off";
			} else {
				// Otherwise, try American English, or fallback to any English
				if (americanEnglish) {
					americanEnglish.click();
					storedSelection = "American English";
				} else if (anyEnglish) {
					anyEnglish.click();
					storedSelection = anyEnglish.getAttribute('aria-label');
				}
			}
			await setVal("selsub", storedSelection);
		}
    };

    const startTime = Date.now();

    const check = setInterval(async () => {
        logger.count("Entry Checking Count");
        const entries = Array.from(document.querySelectorAll('div.preferences-panel__entry'));
        let ending = false;
        if (entries.length != 0) {
            ending = true;
            const subtitlesEntry = entries.find(el => {
                const first = el.firstElementChild;
                if (first == null || !first.classList.contains("preferences-panel__title")) {
                    return false;
                }
                return first.textContent === "Subtitles";
            });
            //logger.log(entries);
            if (subtitlesEntry) {
                subtitles = Array.from(subtitlesEntry.getElementsByTagName("ul").item(0).children);

                selected = subtitles.find(el => el.classList.contains('preferences-panel__option--selected'));
                currentLabel = (selected ? selected.getAttribute('aria-label') || '' : '');

                subtitlesOff = subtitles.find(el => el.getAttribute('aria-label') === 'Subtitles Off');
                americanEnglish = subtitles.find(el => el.getAttribute('aria-label') === 'American English');
                anyEnglish = subtitles.find(el => {
                    const label = el.getAttribute('aria-label') || '';
                    return label.includes('English');
                });

                if (!subtitlesOff) {
                    ending = false;
                    logger.warn("'Subtitles Off' wasn't there, checking again.");
                } else {
                    if (currentLabel !== storedSelection) {
                        const storedElm = subtitles.find(el => el.getAttribute('aria-label') === storedSelection);
                        if (storedElm) {
                            storedElm.click();
                        }
                    }
                }
            } else {
                ending = false;
                logger.warn("Subtitles not found, retrying.");
            }
        } else if (Date.now() - startTime > timeout) {
            ending = true;
            logger.error(`Entry Elements not found within time limit: ${timeout} milliseconds`);
        }
        if (ending) {
            clearInterval(check);
            document.addEventListener('keydown', onKeyDown);
            information.timeElapsed = Date.now() - startTime;
            console.log(information);
        }
    }, interval);
})();