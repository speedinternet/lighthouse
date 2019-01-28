/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Gatherer = require('./gatherer.js');
const pageFunctions = require('../../lib/page-functions.js');

class AnchorElements extends Gatherer {
  /**
   * @param {LH.Gatherer.PassContext} passContext
   * @return {Promise<LH.Artifacts['AnchorElements']>}
   */
  async afterPass(passContext) {
    const driver = passContext.driver;

    // We'll use evaluateAsync because the `node.getAttribute` method doesn't actually normalize
    // the values like access from JavaScript does.
    /** @type {Array<LH.Artifacts.AnchorElement>} */
    const anchors = await driver.evaluateAsync(`(() => {
      ${pageFunctions.getOuterHTMLSnippetString};
      ${pageFunctions.getElementsInDocumentString};
      const resolveURLOrEmpty = url => {
        try { return new URL(url, window.location.href).href; }
        catch (_) { return ''; }
      };

      return getElementsInDocument('a').map(node => ({
        href: node.href instanceof SVGAnimatedString ?
          resolveURLOrEmpty(node.href.baseVal) :
          node.href,
        text: node.href instanceof SVGAnimatedString ?
          node.textContent :
          node.innerText
        rel: node.rel,
        target: node.target,
        outerHTML: getOuterHTMLSnippet(node),
      }));
    })()`, {useIsolation: true});

    for (const anchor of anchors) {
      anchor.rel = anchor.rel.toLowerCase();
      anchor.target = anchor.target.toLowerCase();
    }

    return anchors;
  }
}

module.exports = AnchorElements;
