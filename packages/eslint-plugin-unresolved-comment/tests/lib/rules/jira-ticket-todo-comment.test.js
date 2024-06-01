/* eslint-disable quotes */
const rule = require('../../../lib/rules/jira-ticket-todo-comment');
const RuleTester = require('eslint').RuleTester;
/* eslint-enable quotes */

const ruleTester = new RuleTester();
ruleTester.run(`JIRA ticket TODO comment test`, rule , {
  invalid: [
    {
      code: `// TODO fix this`,
      errors: [{ message: `Add a JIRA ticket number to the TODO comment (e.g. MP-123)` }],
    },
    {
      code: `// TODO MP-123 fix this`,
      errors: [{ message: `Add a JIRA ticket number to the TODO comment (e.g. TP-123)` }],
      options: [{ projectKey: `TP` }],
    },
    {
      code: `// both projectKey and regex are set, this is not allowed`,
      errors: [{ message: `Both projectKey and regex are set. Please only specify one of those properties.` }],
      options: [{ projectKey: `TP`, regex: `^TODO\\s[A-Z]_[A-Z]{1,9}-\\d+\\s?.*` }],
    },
  ],
  valid: [
    {
      code: `// TODO MP-123 fix this`,
    },
    {
      code: `// TODO TP-123 fix this`,
      options: [{ projectKey: `TP` }],
    },
    {
      code: `// TODO TP-123 fix this`,
      options: [{ projectKey: `TP`, message: "Please replace this TODO with a JIRA reference." }],
    },
    {
      code: `// TODO T_P-123 fix this`,
      options: [{ regex: `^TODO\\s[A-Z]_[A-Z]{1,9}-\\d+\\s?.*` }],
    },
    {
      code: `// Todo T_P-123 fix this`,
      options: [{ regex: `^TODO\\s[A-Z]_[A-Z]{1,9}-\\d+\\s?.*` }],
    },
    {
      code: `// ToDo T_P-123 fix this`,
      options: [{ regex: `^TODO\\s[A-Z]_[A-Z]{1,9}-\\d+\\s?.*` }],
    },
    {
      code: `// todo T_P-123 fix this`,
      options: [{ regex: `^TODO\\s[A-Z]_[A-Z]{1,9}-\\d+\\s?.*` }],
    },
  ],
});
