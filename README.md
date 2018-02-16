# parse-server-mail-template-adapter

Adapter for customizing email template of parse-server using Sendgrid

## Installation

Install from npm:

npm install @innocells/parse-server-mail-template-sendgrid-adapter --save

## Configuration

    const ParseServer = require('parse-server').ParseServer;
    const SimpleSendGridAdapter = require('parse-server-sendgrid-adapter');
    const MailTemplateAdapter = require('parse-server-mail-template-adapter');

    const api = new ParseServer({
      // ... Other necessary parameters ...
      appName: 'myAppName',
      publicServerURL: 'http://localhost:1337/parse', // Don't forget to change to https if needed
      emailAdapter: MailTemplateAdapter({
        // Take SimpleSendGridAdapter for example, you can use any other adapter instead
        adapter: SimpleSendGridAdapter({
          apiKey: 'sendgridApiKey',
          fromAddress: 'fromEmailAddress',
        }),
        apiKey: 'sendgridApiKey',
        fromAddress: 'fromEmailAddress',
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

There are some variables can be used in subject and body:

* `%username%`: the user's display name
* `%email%`: the user's email address
* `%appname%`: your application's display name
* `%link%`: the link the user must click to perform the requested action
