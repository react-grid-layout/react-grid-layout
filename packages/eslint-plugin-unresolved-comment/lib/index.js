/**
 * @fileoverview Checks TODO comments and informs about missing Jira ticket mentions
 * @author bamboechop <npmjs@bamboechop.at>
 */
"use strict";

// import all rules in lib/rules
module.exports.rules = {
  'unresolved-comment': require(`./rules/unresolved-comment`),
};



