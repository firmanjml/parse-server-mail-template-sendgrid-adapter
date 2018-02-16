const mockAPI = jest.fn();

jest.mock('sendgrid', () =>
  jest.fn().mockImplementation(() => ({
    emptyRequest: jest.fn(() => ({})),
    API: mockAPI
  }))
);

const MailTemplateAdapter = require('../index');

afterEach(() => {
  // import and pass your custom axios instance to this method
  mockAPI.mockReset();
});

describe('MailTemplateAdapter', () => {
  describe('resetPassword', async () => {
    it('should throw if no argument is passed', async () => {
      expect(() => {
        MailTemplateAdapter();
      }).toThrow('MailTemplateAdapter requires an adapter');
    });

    it('should throw if no template is passed', async () => {
      expect(() => {
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

    it('should throw if no fromAddress is passed', async () => {
      expect(() => {
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

    it('should throw if no apiKey is passed', async () => {
      expect(() => {
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

    it('should call correctly the sendgrid api', async () => {
      const mailTemplateAdapter = MailTemplateAdapter({
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
          get: key => {
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

      const { calls } = mockAPI.mock;
      expect(calls).toEqual([
        [
          {
            body: {
              from: {
                email: 'a@a.com'
              },
              personalizations: [
                {
                  to: [
                    {
                      email: 'foo@bar.com'
                    }
                  ],
                  substitutions: {
                    '%link%': 'http://test.com/',
                    '%email%': 'foo@bar.com',
                    '%username%': 'foo',
                    '%appname%': 'foo'
                  }
                }
              ],
              template_id: '1234567890'
            },
            method: 'POST',
            path: '/v3/mail/send'
          }
        ]
      ]);
    });
  });
});
