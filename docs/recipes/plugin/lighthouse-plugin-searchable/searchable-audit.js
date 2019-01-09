/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('../../../../lighthouse-core/index.js').Audit;

/**
 * @fileoverview A fake additional check of the robots.txt file.
 */

class LoadAudit extends Audit {
  static get meta() {
    return {
      id: 'searchable-audit',
      title: 'Site ready for crawling and searching.',
      failureTitle: 'Robots.txt failed the special plugin check.',
      description: 'Robots.txt needs to allow crawling so page can be found in search.',

      // The name of the custom gatherer class that provides input to this audit.
      requiredArtifacts: ['RobotsTxt'],
    };
  }

  static audit(artifacts) {
    // We'll rely only on the status code for this example.
    const statusCode = artifacts.RobotsTxt.status;
    const rawValue = statusCode === 200;

    return {
      rawValue,
      displayValue: `Status code was ${statusCode}`,
    };
  }
}

module.exports = LoadAudit;
