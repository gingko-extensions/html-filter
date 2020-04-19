/* global Backbone app */

function hasParentWithMatchingSelector(target, selector) {
    return [...document.querySelectorAll(selector)].some(
        (el) => el !== target && el.contains(target)
    );
}

// Native
function parseHTML(string) {
  const context = document.implementation.createHTMLDocument();

  // Set the base href for the created document so any parsed elements with URLs
  // are based on the document's URL
  const base = context.createElement('base');
  base.href = document.location.href;
  context.head.appendChild(base);

  context.body.innerHTML = string;
  return Array.from(context.body.childNodes);
}
// rewrite the text of all child-leaf html elements of `elem`
// apply the replacements
function rewriteHtml(elem, replacements) {
    const elements = elem.getElementsByTagName("*");

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];

        for (let j = 0; j < element.childNodes.length; j++) {
            const node = element.childNodes[j];

            if (node.nodeType === 3 && hasParentWithMatchingSelector(node, ".view")) {
                const text = node.nodeValue;
                let replacedText = text;

                for (const [key, value] of replacements) {
                    replacedText = replacedText.replace(key, value);
                }
                const dom = parseHTML(replacedText);

                if (replacedText !== text) {
                    // for elem in dom

                    if (dom.length > 0) {
                        let last_elem = dom[dom.length - 1];

                        element.replaceChild(last_elem, node);

                        for (let d = dom.length - 2; d >= 0; d--) {
                            if (d >= 0) {
                                last_elem = element.insertBefore(dom[d], last_elem);
                            }
                        }
                    } else {
                        element.replaceChild(document.createTextNode(replacedText), node);
                    }
                }
            }
        }
    }
}
function until(conditionFunction) {
    const poll = (resolve) => {
        if (conditionFunction()) resolve();
        else setTimeout((_) => poll(resolve), 400);
    };

    return new Promise(poll);
}

async function waitForAndRun(condition, run) {
    await until(condition);
    run();
}

function setupBackboneEvents(config) {
    Backbone.on("card:save", (id) => {
        const card = document.querySelector("#card" + id);
        rewriteHtml(card, config.replacements);
    });

    Backbone.on("card:deactivate", (id) => {
        const card = document.querySelector("#card" + id);
        rewriteHtml(card, config.replacements);
    });
}

function setupAppEvents(config) {
    for (const card of app.get("cards").models) {
        const card_element = document.querySelector("#card" + card.id);
        rewriteHtml(card_element, config.replacements);
    }
}

function run(config, init) {
    waitForAndRun(
        () => typeof Backbone !== "undefined",
        () => {
            setupBackboneEvents(config);
        }
    );
    waitForAndRun(
        () => typeof app !== "undefined" && app.get("cards").length > 0,
        () => {
            setupAppEvents(config);
        }
    );
    init();
}

window.run_html_filter = run;
