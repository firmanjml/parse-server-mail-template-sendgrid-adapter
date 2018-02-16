import fs from 'fs';

let replacePlaceHolder = (text, options) => {
  return text
    .replace(/%email%/g, options.user.get('email'))
    .replace(/%username%/g, options.user.get('username'))
    .replace(/%appname%/g, options.appName)
    .replace(/%link%/g, options.link);
};

let MailTemplateAdapter = mailOptions => {
  if (!mailOptions || !mailOptions.adapter) {
    throw 'MailTemplateAdapter requires an adapter.';
  }
  const adapter = mailOptions.adapter;

  if (!mailOptions.template) {
    return adapter;
  }

  const customized = {};

  if (mailOptions.template.verification) {
    const verification = mailOptions.template.verification;

    if (!verification.subject) {
      throw 'MailTemplateAdapter verification requires subject.';
    }
    const verificationSubject = verification.subject;
    let verificationText = '';

    if (verification.body) {
      verificationText = verification.body;
    } else if (verification.bodyFile) {
      verificationText = fs.readFileSync(verification.bodyFile, 'utf8');
    } else if (verification.sendgridTemplateId) {
      if (!verification.fromAddress) {
        throw 'MailTemplateAdapter verification requires fromAddress when use sendgrid.';
      }
      if (!verification.sendgridApiKey) {
        throw 'MailTemplateAdapter verification requires sendgridApiKey when use sendgrid';
      }
    } else {
      throw 'MailTemplateAdapter verification requires body.';
    }

    customized.sendVerificationEmail = function(options) {
      return new Promise((resolve, reject) => {
        const to = options.user.get('email');
        const text = replacePlaceHolder(verificationText, options);
        const subject = replacePlaceHolder(verificationSubject, options);
        const sendgridTemplateId = verification.sendgridTemplateId;

        if (sendgridTemplateId) {
          const sendgrid = require('sendgrid')(verification.sendgridApiKey);
          const request = sendgrid.emptyRequest();
          request.body = {
            from: { email: verification.fromAddress },
            personalizations: [
              {
                to: [
                  {
                    email: to
                  }
                ],
                substitutions: {
                  '%link%': options.link,
                  '%email%': options.user.get('email'),
                  '%username%': options.user.get('username'),
                  '%appname%': options.appName
                }
              }
            ],
            subject: verification.subject,
            template_id: verification.sendgridTemplateId
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
          this.sendMail({ text: text, to: to, subject: subject }).then(
            json => {
              resolve(json);
            },
            err => {
              reject(err);
            }
          );
        }
      });
    };
  }

  if (mailOptions.template.resetPassword) {
    const resetPassword = mailOptions.template.resetPassword;

    if (!resetPassword.subject) {
      throw 'MailTemplateAdapter resetPassword requires subject.';
    }
    const resetPasswordSubject = resetPassword.subject;
    let resetPasswordText = '';

    if (resetPassword.body) {
      resetPasswordText = resetPassword.body;
    } else if (resetPassword.bodyFile) {
      resetPasswordText = fs.readFileSync(resetPassword.bodyFile, 'utf8');
    } else if (resetPassword.sendgridTemplateId) {
      if (!resetPassword.fromAddress) {
        throw 'MailTemplateAdapter resetPassword requires fromAddress when use sendgrid.';
      }
      if (!resetPassword.sendgridApiKey) {
        throw 'MailTemplateAdapter resetPassword requires sendgridApiKey when use sendgrid';
      }
    } else if (!resetPassword.sendgridTemplateId) {
      throw 'MailTemplateAdapter resetPassword requires body.';
    }

    customized.sendPasswordResetEmail = function(options) {
      return new Promise((resolve, reject) => {
        const to = options.user.get('email');
        const subject = replacePlaceHolder(resetPasswordSubject, options);
        const html = replacePlaceHolder(resetPasswordText, options);
        const sendgridTemplateId = resetPassword.sendgridTemplateId;
        if (sendgridTemplateId) {
          const sendgrid = require('sendgrid')(resetPassword.sendgridApiKey);
          const request = sendgrid.emptyRequest();
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
                  '%email%': options.user.get('email'),
                  '%username%': options.user.get('username'),
                  '%appname%': options.appName
                }
              }
            ],
            subject: resetPassword.subject,
            template_id: resetPassword.sendgridTemplateId
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
          this.sendMail({ html: html, to: to, subject: subject }).then(
            json => {
              resolve(json);
            },
            err => {
              reject(err);
            }
          );
        }
      });
    };
  }

  return Object.freeze(Object.assign(customized, adapter));
};

module.exports = MailTemplateAdapter;
