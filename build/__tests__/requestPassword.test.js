'use strict';

var mockAPI = jest.fn();

jest.mock('sendgrid', function () {
  return jest.fn().mockImplementation(function () {
    return {
      emptyRequest: jest.fn(function () {
        return {};
      }),
      API: mockAPI
    };
  });
});

var MailTemplateAdapter = require('../index');

afterEach(function () {
  // import and pass your custom axios instance to this method
  mockAPI.mockReset();
});

describe('MailTemplateAdapter', function () {
  describe('resetPassword', async function () {
    it('should throw if no argument is passed', async function () {
      expect(function () {
        MailTemplateAdapter();
      }).toThrow('MailTemplateAdapter requires an adapter');
    });

    it('should throw if no template is passed', async function () {
      expect(function () {
        MailTemplateAdapter({
          adapter: {},
          apiKey: '23sdf78jio',
          fromAddress: 'a@a.com',
          template: {
            resetPassword: {}
          }
        });
      }).toThrow('MailTemplateAdapter requires a template id');
    });

    it('should throw if no fromAddress is passed', async function () {
      expect(function () {
        MailTemplateAdapter({
          adapter: {},
          apiKey: '23sdf78jio',
          template: {
            resetPassword: {
              templateId: '1234567890'
            }
          }
        });
      }).toThrow('MailTemplateAdapter requires a fromAddress');
    });

    it('should throw if no apiKey is passed', async function () {
      expect(function () {
        MailTemplateAdapter({
          adapter: {},
          fromAddress: 'a@a.com',
          template: {
            resetPassword: {
              templateId: '1234567890'
            }
          }
        });
      }).toThrow('MailTemplateAdapter requires a apiKey');
    });

    it('should call correctly the sendgrid api', async function () {
      var mailTemplateAdapter = MailTemplateAdapter({
        adapter: {},
        apiKey: '23sdf78jio',
        fromAddress: 'a@a.com',
        template: {
          resetPassword: {
            templateId: '1234567890'
          }
        }
      });

      await mailTemplateAdapter.sendPasswordResetEmail({
        link: 'http://test.com/',
        user: {
          get: function get(key) {
            switch (key) {
              case 'email':
                return 'foo@bar.com';
              case 'username':
              default:
                return 'foo';
            }
          }
        },
        appName: 'foo'
      });

      var calls = mockAPI.mock.calls;

      expect(calls).toEqual([[{
        body: {
          from: {
            email: 'a@a.com'
          },
          personalizations: [{
            to: [{
              email: 'foo@bar.com'
            }],
            substitutions: {
              '%link%': 'http://test.com/',
              '%email%': 'foo@bar.com',
              '%username%': 'foo',
              '%appname%': 'foo'
            }
          }],
          template_id: '1234567890'
        },
        method: 'POST',
        path: '/v3/mail/send'
      }]]);
    });
  });
});