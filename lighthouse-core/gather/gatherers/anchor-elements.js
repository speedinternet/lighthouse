/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Gatherer = require('./gatherer.js');
const pageFunctions = require('../../lib/page-functions.js');

/**
 * Function that is stringified and run in the page to collect anchor elements.
 * Additional complexity is introduced because anchors can be HTML or SVG elements.
 * @return {LH.Artifacts['AnchorElements']}
 */
/* istanbul ignore next */
function collectAnchorElements() {
  /** @param {string} url */
  const resolveURLOrEmpty = url => {
    try { return new URL(url, window.location.href).href; }
    catch (_) { return ''; }
  };

  /** @type {Array<HTMLAnchorElement|SVGAElement>} */
  // @ts-ignore - put into scope via stringification
  const anchorElements = getElementsInDocument('a');

  return anchorElements.map(node => {
    /** @type {HTMLAnchorElement} */
    const anchorNode = (node);
    /** @type {LH.Artifacts.AnchorElement} */
    const anchorElementInfo = {
      href: anchorNode.href,
      text: anchorNode.innerText,
      rel: anchorNode.rel,
      target: anchorNode.target,
      // @ts-ignore - put into scope via stringification
      outerHTML: getOuterHTMLSnippet(node),
    }

    /** @type {string|SVGAnimatedString} */
    const href = (anchorNode.href);
    /** @type {SVGAElement} */
    const svgNode = (node);
    if (href instanceof SVGAnimatedString) {
      anchorElementInfo.href = resolveURLOrEmpty(href.baseVal);
      anchorElementInfo.text = svgNode.textContent || '';
      anchorElementInfo.rel = '';
      anchorElementInfo.target = svgNode.target.baseVal || '';
    }

    return anchorElementInfo;
  });
}

class AnchorElements extends Gatherer {
  /**
   * @param {LH.Gatherer.PassContext} passContext
   * @return {Promise<LH.Artifacts['AnchorElements']>}
   */
  async afterPass(passContext) {
    const driver = passContext.driver;
    const expression = `(() => {
      ${pageFunctions.getOuterHTMLSnippetString};
      ${pageFunctions.getElementsInDocumentString};

      return (${collectAnchorElements})();
    })()`

    // We'll use evaluateAsync because the `node.getAttribute` method doesn't actually normalize
    // the values like access from JavaScript does.
    /** @type {Array<LH.Artifacts.AnchorElement>} */
    return driver.evaluateAsync(expression, {useIsolation: true});
  }
}

module.exports = AnchorElements;
