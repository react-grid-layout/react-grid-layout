module.exports = {
    create(context) {
        return {
            Program(node) {
                /*        const options = context.options[0];
                        const projectKey = options && options.projectKey;
                        const regexOption = options && options.regex;
                        const messageOption = options && options.message;
                        if(projectKey && regexOption) {
                          context.report({ messageId: `bothOptionsProvided`, node });
                          return;
                        }
                        let regex = new RegExp(`^TODO\\s[A-Z]{2,255}-\\d+(\\s.*)?`, `i`);
                        if(projectKey) {
                          regex = new RegExp(`^TODO\\s${projectKey}-\\d+\\s?.*`, `i`);
                        }
                        if(regexOption) {
                          regex = new RegExp(regexOption, `i`);
                        }*/
                for (const node of context.getSourceCode().getAllComments()) {
                    const value = node.value.trimStart();
                    /*          if(value.toLowerCase().startsWith(`todo`) && !regex.test(value)) {
                                const message = messageOption ? { message: messageOption } : { messageId: `addJiraTicketNumber`};
                                context.report({ data: { ticketNumber: `${projectKey ? projectKey : `MP`}-123` }, ...message, node });
                              }*/
                    if (value.toLowerCase().startsWith(`todo`) && process.env.BRANCH===`master`) {
                        const message = false ? {message: ""} : {messageId: `unresolvedComment`};
                        context.report({ data: { ticketNumber: `${`MP`}-123` }, ...message, node });

                    }
                }
            },
        };
    },
    meta: {
        docs: {
            category: `Best Practices`,
            description: `Checks TODO comments and informs about missing Jira ticket mentions`,
            recommended: true,
            url: `https://github.com/bamboechop/eslint-plugin-jira-ticket-todo-comment`,
        },
        messages: {
            "unresolvedComment": `branch name matches todo ticket id, resolve the comment`,
            addJiraTicketNumber: `Add a JIRA ticket number to the TODO comment (e.g. {{ ticketNumber }})`,
            bothOptionsProvided: `Both projectKey and regex are set. Please only specify one of those properties.`,
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    projectKey: {
                        type: `string`,
                    },
                    regex: {
                        type: `string`,
                    },
                    message: {
                        type: `string`,
                    },
                },
                type: `object`,
            },
        ],
        type: `problem`,
    },
};
