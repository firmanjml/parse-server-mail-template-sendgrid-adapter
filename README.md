# parse-server-mail-template-adapter

Email adapter for Parse Server which uses Sendgrid templates

## Installation

Install from npm:

npm install @innocells/parse-server-mail-template-sendgrid-adapter --save

## Configuration

    const ParseServer = require('parse-server').ParseServer;
    const SimpleSendGridAdapter = require('parse-server-sendgrid-adapter');
    const MailTemplateAdapter = require('@innocells/parse-server-mail-template-sendgrid-adapter');

    const api = new ParseServer({
      // ... Other necessary parameters ...
      appName: 'myAppName',
      publicServerURL: 'http://localhost:1337/parse',
      emailAdapter: MailTemplateAdapter({
        // Take any email as your default adapter, for example SimpleSendGridAdapter
        adapter: SimpleSendGridAdapter({
          apiKey: 'sendgridApiKey',
          fromAddress: 'fromEmailAddress',
        }),
        apiKey: 'sendgridApiKey',
        fromAddress: 'fromEmailAddress',
        fromName: 'fromName',
        template: {
          verification: {
            templateId: 'templateId'
          },
          resetPassword: {  // Same as verification
            templateId: 'templateId'
          }
        }
      })
    });

These variables can be used in your template body:

* `%username%`: the user's display name
* `%email%`: the user's email address
* `%appname%`: your application's display name
* `%link%`: the link the user must click to perform the requested action
