"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var replacePlaceHolder = function replacePlaceHolder(text, options) {
  return text.replace(/%email%/g, options.user.get("email")).replace(/%username%/g, options.user.get("username")).replace(/%appname%/g, options.appName).replace(/%link%/g, options.link);
};

var MailTemplateAdapter = function MailTemplateAdapter(mailOptions) {
  if (!mailOptions || !mailOptions.adapter) {
    throw 'MailTemplateAdapter requires an adapter.';
  }
  var adapter = mailOptions.adapter;

  if (!mailOptions.template) {
    return adapter;
  }

  var customeized = {};

  if (mailOptions.template.verification) {
    var verification = mailOptions.template.verification;

    if (!verification.subject) {
      throw 'MailTemplateAdapter verification requires subject.';
    }
    var verificationSubject = verification.subject;
    var verificationText = "";

    if (verification.body) {
      verificationText = verification.body;
    } else if (verification.bodyFile) {
      verificationText = _fs2.default.readFileSync(verification.bodyFile, "utf8");
    } else {
      throw 'MailTemplateAdapter verification requires body.';
    }

    customeized.sendVerificationEmail = function (options) {
      var _this = this;

      return new Promise(function (resolve, reject) {

        var to = options.user.get("email");
        var text = replacePlaceHolder(verificationText, options);
        var subject = replacePlaceHolder(verificationSubject, options);

        _this.sendMail({ text: text, to: to, subject: subject }).then(function (json) {
          resolve(json);
        }, function (err) {
          reject(err);
        });
      });
    };
  }

  if (mailOptions.template.resetPassword) {
    var resetPassword = mailOptions.template.resetPassword;

    if (!resetPassword.subject) {
      throw 'MailTemplateAdapter resetPassword requires subject.';
    }
    var resetPasswordSubject = resetPassword.subject;
    var resetPasswordText = "";

    if (resetPassword.body) {
      resetPasswordText = resetPassword.body;
    } else if (resetPassword.bodyFile) {
      resetPasswordText = _fs2.default.readFileSync(resetPassword.bodyFile, "utf8");
    } else if (resetPassword.sendgridTemplateId && !resetPassword.fromAddress) {
      throw 'MailTemplateAdapter resetPassword requires fromAddress when use sendgrid.';
    } else if (!resetPassword.sendgridTemplateId) {
      throw 'MailTemplateAdapter resetPassword requires body.';
    }

    customeized.sendPasswordResetEmail = function (options) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var to = options.user.get("email");
        var subject = replacePlaceHolder(resetPasswordSubject, options);
        var html = replacePlaceHolder(resetPasswordText, options);
        var sendgridTemplateId = resetPassword.sendgridTemplateId;
        if (sendgridTemplateId) {
          var sendgrid = require('sendgrid')(resetPassword.apiKey);
          var request = sendgrid.emptyRequest();
          request.body = {
            from: { email: resetPassword.fromAddress },
            personalizations: [{
              to: [{
                email: to
              }],
              substitutions: { '%LINK%': options.link }
            }],
            subject: resetPassword.subject,
            template_id: resetPassword.sendgridTemplateId
          };
          request.method = 'POST';
          request.path = '/v3/mail/send';
          sendgrid.API(request, function (error, response) {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
        } else {
          _this2.sendMail({ html: html, to: to, subject: subject }).then(function (json) {
            resolve(json);
          }, function (err) {
            reject(err);
          });
        }
      });
    };
  }

  return Object.freeze(Object.assign(customeized, adapter));
};

module.exports = MailTemplateAdapter;