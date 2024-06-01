# eslint-plugin-jira-ticket-todo-comment

Checks TODO comments and informs about missing Jira ticket mentions

## Installation

```sh
npm install eslint-plugin-jira-ticket-todo-comment --save-dev
```

## Usage

Add `jira-ticket-todo-comment` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "jira-ticket-todo-comment"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "jira-ticket-todo-comment/jira-ticket-todo-comment": "error"
    }
}
```

## Rule Details

This rule aims to enforce consistent style of TODO comments making it easier for developer teams to quickly see if a TODO comment is already in JIRA.

## Options

This rule has an optional object option.

* `"projectKey": "TP"` (default `MP`) sets a specific project key which is used in your JIRA project; when not provided the rule will check against the default regex; can **NOT** be set together with `"regex"` option
```json
{
    "rules": {
        "jira-ticket-todo-comment/jira-ticket-todo-comment": ["error", { "projectKey":  "TP" }]
    }
}
```
* `"regex": "^TODO\\s[A-Z]_[A-Z]{1,9}-\\d+\\s?.*"` (default `^TODO\\s[A-Z]{2,255}-\\d+(\\s.*)?`) allows you to override the default regex which is used to check for the JIRA ticket format; can **NOT** be set together with `"projectKey"` option
```json
{
    "rules": {
        "jira-ticket-todo-comment/jira-ticket-todo-comment": ["error", { "regex":  "^TODO\\s[A-Z]_[A-Z]{1,9}-\\d+\\s?.*" }]
    }
}
```
* `"message": "Please replace this TODO with a JIRA reference."` allows you to override the default message that appears when a TODO is detected without any JIRA key.
```json
{
    "rules": {
        "jira-ticket-todo-comment/jira-ticket-todo-comment": ["error", { "message":  "Please replace this TODO with a JIRA reference." }]
    }
}
```
