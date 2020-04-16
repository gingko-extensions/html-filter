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
// @require  https://gist.githubusercontent.com/JanSurft/6166749a7eea008261d1c32e3462f8ca/raw/5c4993c6ef11b3a140280a89a2772b8676a57cbe/rewrite_html.js
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

"use strict";

// the text to replace in html elements
const REPLACEMENTS = [
    [/{#([a-zA-Z0-9_:\-]+)}/gi, "<a name=\"$1\"></a>"],
    [/@([a-zA-Z0-9_:\-]+)/gi, "<a href=\"#$1\">$1</a>"],
];

// async function to compoensate for
// loading time of html dom for code-view elements
async function start(delay) {
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve("done!"), delay);
    });

    let result = await promise; // wait until the promise resolves (*)
    // your page initialization code here
    // the DOM will be available here
    rewriteHtml(document, REPLACEMENTS);
}

function until(conditionFunction) {
    const poll = (resolve) => {
        if (conditionFunction()) resolve();
        else setTimeout((_) => poll(resolve), 400);
    };

    return new Promise(poll);
}

// run if url changes (history api)
/*
window.onpopstate = function(event) {
  
  // don't need to rerun add_click_handlers
  // as those are still active on the html body
  start(1000);
};
*/

async function waitForAppAndCards() {
    await until(() => typeof app !== "undefined");
    await until(() => app.get("cards").length > 0);

    for (const card of app.get("cards").models) {
        let card_element = document.querySelector("#card" + card.id);
        rewriteHtml(card_element, REPLACEMENTS);
    }
}

async function waitForBackbone() {
    await until(() => typeof Backbone !== "undefined");

    Backbone.on("card:save", (id) => {
        let card = document.querySelector("#card" + id);
        rewriteHtml(card, REPLACEMENTS);
    });

    Backbone.on("card:deactivate", (id) => {
        let card = document.querySelector("#card" + id);
        rewriteHtml(card, REPLACEMENTS);
    });
}

// run on document load
(function () {
    waitForBackbone();
    waitForAppAndCards();
})();
