function hasParentWithMatchingSelector(target, selector) {
    return [...document.querySelectorAll(selector)].some(
        (el) => el !== target && el.contains(target)
    );
}

// rewrite the text of all child-leaf html elements of `elem`
// apply the replacements
function rewriteHtml(elem, replacements) {
    var elements = elem.getElementsByTagName("*");

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        for (var j = 0; j < element.childNodes.length; j++) {
            var node = element.childNodes[j];

            if (node.nodeType === 3 && hasParentWithMatchingSelector(node, ".view")) {
                let text = node.nodeValue;
                let replacedText = text;

                for (const [key, value] of replacements) {
                    replacedText = replacedText.replace(key, value);
                }
                let dom = $.parseHTML(replacedText);

                if (replacedText !== text) {
                    // for elem in dom

                    if (dom.length > 0) {
                        let last_elem = dom[dom.length - 1];

                        element.replaceChild(last_elem, node);

                        for (var d = dom.length - 2; d >= 0; d--) {
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
