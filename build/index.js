'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (mailOptions) {
  if (!mailOptions || !mailOptions.adapter) {
    throw 'MailTemplateAdapter requires an adapter';
  }

  var adapter = mailOptions.adapter,
      apiKey = mailOptions.apiKey,
      fromAddress = mailOptions.fromAddress,
      fromName = mailOptions.fromName;

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

  var customized = {};

  if (mailOptions.template.verification) {
    var templateId = mailOptions.template.verification.templateId;


    if (!templateId) {
      throw 'MailTemplateAdapter requires a template id';
    }

    customized.sendVerificationEmail = function (options) {
      return sendTemplate({
        link: options.link,
        email: options.user.get('email'),
        username: options.user.get('username'),
        appName: options.appName,
        templateId: templateId,
        apiKey: apiKey,
        fromAddress: fromAddress,
        fromName: fromName
      });
    };
  }

  if (mailOptions.template.resetPassword) {
    var _templateId = mailOptions.template.resetPassword.templateId;


    if (!_templateId) {
      throw 'MailTemplateAdapter requires a template id';
    }

    customized.sendPasswordResetEmail = function (options) {
      return sendTemplate({
        link: options.link,
        email: options.user.get('email'),
        username: options.user.get('username'),
        appName: options.appName,
        templateId: _templateId,
        apiKey: apiKey,
        fromAddress: fromAddress,
        fromName: fromName
      });
    };
  }

  return Object.freeze(Object.assign(customized, adapter));
};

var replacePlaceHolder = function replacePlaceHolder(text, options) {
  return text.replace(/%email%/g, options.user.get('email')).replace(/%username%/g, options.user.get('username')).replace(/%appname%/g, options.appName).replace(/%link%/g, options.link);
};

function sendTemplate(params) {
  var sendgrid = require('sendgrid')(params.apiKey);
  var email = params.email,
      link = params.link,
      username = params.username,
      appName = params.appName,
      fromAddress = params.fromAddress,
      fromName = params.fromName,
      templateId = params.templateId;

  var template_id = templateId;
  var request = sendgrid.emptyRequest();
  request.body = {
    from: { email: fromAddress, name: fromName },
    personalizations: [{
      to: [{
        email: email
      }],
      substitutions: {
        '%link%': link,
        '%email%': email,
        '%username%': username,
        '%appname%': appName
      }
    }],
    template_id: template_id
  };
  request.method = 'POST';
  request.path = '/v3/mail/send';
  return sendgrid.API(request);
}
