import fs from 'fs';

let replacePlaceHolder = (text, options) => {
  return text.replace(/%email%/g, options.user.get("email"))
    .replace(/%username%/g, options.user.get("username"))
    .replace(/%appname%/g, options.appName)
    .replace(/%link%/g, options.link);
}

let MailTemplateAdapter = mailOptions => {
  if (!mailOptions || !mailOptions.adapter) {
    throw 'MailTemplateAdapter requires an adapter.';
  }
  var adapter = mailOptions.adapter;

  if (!mailOptions.template) {
    return adapter;
  }

  var customeized = {}

  if (mailOptions.template.verification) {
    var verification = mailOptions.template.verification;

    if (!verification.subject) {
      throw 'MailTemplateAdapter verification requires subject.';
    }
    var verificationSubject = verification.subject;
    var verificationText = "";

    if (verification.body) {
      verificationText = verification.body;
    }
    else if (verification.bodyFile) {
      verificationText = fs.readFileSync(verification.bodyFile, "utf8");
    }
    else {
      throw 'MailTemplateAdapter verification requires body.';
    }

    customeized.sendVerificationEmail = function (options) {
      return new Promise((resolve, reject) => {

        var to = options.user.get("email");
        var text = replacePlaceHolder(verificationText, options);
        var subject = replacePlaceHolder(verificationSubject, options);

        this.sendMail({ text: text, to: to, subject: subject }).then(json => {
          resolve(json);
        }, err => {
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
    }
    else if (resetPassword.bodyFile) {
      resetPasswordText = fs.readFileSync(resetPassword.bodyFile, "utf8");
    }
    else if (resetPassword.sendgridTemplateId) {
      if (!resetPassword.fromAddress) {
        throw 'MailTemplateAdapter resetPassword requires fromAddress when use sendgrid.';
      }
      if (!resetPassword.sendgridApiKey) {
        throw 'MailTemplateAdapter resetPassword requires sendgridApiKey when use sendgrid';
      }
    }
    else if (!resetPassword.sendgridTemplateId) {
      throw 'MailTemplateAdapter resetPassword requires body.';
    }

    customeized.sendPasswordResetEmail = function (options) {
      return new Promise((resolve, reject) => {
        var to = options.user.get("email");
        var subject = replacePlaceHolder(resetPasswordSubject, options);
        var html = replacePlaceHolder(resetPasswordText, options);
        var sendgridTemplateId = resetPassword.sendgridTemplateId;
        if (sendgridTemplateId) {
          const sendgrid = require('sendgrid')(resetPassword.sendgridApiKey);
          var request = sendgrid.emptyRequest();
          request.body = {
            from: { email: resetPassword.fromAddress },
            personalizations: [
              {
                to: [
                  {
                    email: to
                  }
                ],
                substitutions: {
                  '%link%': options.link,
                  '%email%': options.user.get("email"),
                  '%username%': options.user.get("username"),
                  '%appname%': options.appName
                }
              }
            ],
            subject: resetPassword.subject,
            template_id: resetPassword.sendgridTemplateId,
          };
          request.method = 'POST';
          request.path = '/v3/mail/send';
          sendgrid.API(request, (error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
        } else {
          this.sendMail({ html: html, to: to, subject: subject }).then(json => {
            resolve(json);
          }, err => {
            reject(err);
          });
        }
      });
    };
  }


  return Object.freeze(Object.assign(customeized, adapter));
}

module.exports = MailTemplateAdapter
