// ==UserScript==
// @name         ReplaceText
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      https://gingkoapp.com/*
// @run-at       document-start
// @grant        none
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require  https://cdn.jsdelivr.net/gh/gingko-extensios/html-filter@0.0.1/src/html-filter.js
// ==/UserScript==

/*
MIT License
Copyright (c) 2020 Jan Hermes
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* global run */

"use strict";

function until(conditionFunction) {
    const poll = (resolve) => {
        if (conditionFunction()) resolve();
        else setTimeout((_) => poll(resolve), 400);
    };

    return new Promise(poll);
}

// the text to replace in html elements
const REPLACEMENTS = [
    [/{#([a-zA-Z0-9_:-]+)}/gi, "<a name=\"$1\"></a>"],
    [/@([a-zA-Z0-9_:-]+)/gi, "<a href=\"#$1\">$1</a>"],
];

// run if url changes (history api)
/*
window.onpopstate = function(event) {
  
  // don't need to rerun add_click_handlers
  // as those are still active on the html body
  start(1000);
};
*/

async function waitForRun() {
    await until(() => typeof run !== "undefined");

    run(
        {
            replacements: REPLACEMENTS,
        },
        () => true
    );
}

// run on document load
(function () {
    waitForRun();
})();
