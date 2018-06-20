import fs from 'fs';

module.exports = mailOptions => {
  if (!mailOptions || !mailOptions.adapter) {
    throw 'MailTemplateAdapter requires an adapter';
  }

  const { adapter, apiKey, fromAddress, fromName } = mailOptions;

  if (!mailOptions.template) {
    return mailOptions.adapter;
  }

  if (!fromAddress) {
    throw 'MailTemplateAdapter requires a fromAddress';
  }
  if (!fromName) {
    throw 'MailTemplateAdapter requires a fromName';
  }
  if (!apiKey) {
    throw 'MailTemplateAdapter requires a apiKey';
  }

  const customized = {};

  if (mailOptions.template.verification) {
    const { templateId } = mailOptions.template.verification;

    if (!templateId) {
      throw 'MailTemplateAdapter requires a template id';
    }

    customized.sendVerificationEmail = options =>
      sendTemplate({
        link: options.link,
        email: options.user.get('email'),
        username: options.user.get('username'),
        appName: options.appName,
        templateId,
        apiKey,
        fromAddress,
        fromName
      });
  }

  if (mailOptions.template.resetPassword) {
    const { templateId } = mailOptions.template.resetPassword;

    if (!templateId) {
      throw 'MailTemplateAdapter requires a template id';
    }

    customized.sendPasswordResetEmail = options =>
      sendTemplate({
        link: options.link,
        email: options.user.get('email'),
        username: options.user.get('username'),
        appName: options.appName,
        templateId,
        apiKey,
        fromAddress,
        fromName
      });
  }

  return Object.freeze(Object.assign(customized, adapter));
};

const replacePlaceHolder = (text, options) =>
  text
    .replace(/%email%/g, options.user.get('email'))
    .replace(/%username%/g, options.user.get('username'))
    .replace(/%appname%/g, options.appName)
    .replace(/%link%/g, options.link);

function sendTemplate(params) {
  const sendgrid = require('sendgrid')(params.apiKey);
  const { email, link, username, appName, fromAddress, fromName, templateId } = params;
  const template_id = templateId;
  const request = sendgrid.emptyRequest();
  request.body = {
    from: { email: fromAddress, name: fromName },
    personalizations: [
      {
        to: [
          {
            email
          }
        ],
        substitutions: {
          '%link%': link,
          '%email%': email,
          '%username%': username,
          '%appname%': appName
        }
      }
    ],
    template_id
  };
  request.method = 'POST';
  request.path = '/v3/mail/send';
  return sendgrid.API(request);
}
