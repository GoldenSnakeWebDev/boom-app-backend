export const passwordResetTemplate = async (opts: {
  code: string;
  name: string;
  host: string;
}) => {
  return `
    <!DOCTYPE htmlPUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html lang="en">
        <head>
            <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        </head>
        <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Boom reset your password
        </div>
        <table style="width:100%;background-color:#f6f9fc;padding:10px 0" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation">
            <tbody>
            <tr>
                <td>
                <div><!--[if mso | IE]>
                    <table role="presentation" width="100%" align="center" style="max-width:37.5em;margin:0 auto;background-color:#ffffff;border:1px solid #f0f0f0;width:600px;padding:45px;"><tr><td></td><td style="width:37.5em;background:#ffffff">
                <![endif]--></div>
                <div style="max-width:37.5em;margin:0 auto;background-color:#ffffff;border:1px solid #f0f0f0;width:600px;padding:45px"><img alt="Dropbox" src="${opts.host}/LOGOS/boom_logo.png" width="40" height="33" style="display:block;outline:none;border:none;text-decoration:none" />
                    <table style="width:100%" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                    <tbody>
                        <tr>
                        <td>
                            <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">${opts.name},</p>
                            <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">
                            You have recently requested a password change for your boom account. If this was you, your password reset code is:</p>
                            <p style="font-size:32px;line-height:40px;margin:0 auto;color:#000;display:inline-block;font-family:HelveticaNeue-Bold;font-weight:700;letter-spacing:6px;padding-bottom:8px;padding-top:8px;width:100%;text-align:center">${opts.code}</p>
                            <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Happy Booming</p>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                <div><!--[if mso | IE]>
                </td><td></td></tr></table>
                <![endif]--></div>
                </td>
            </tr>
            </tbody>
        </table>

    </html>`;
};

export const commonEmailMessage = (opts: {
  message: string;
  subject: string;
  name: string;
  host: string;
}) => {
  return `
      <!DOCTYPE htmlPUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html lang="en">
          <head>
              <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
          </head>
          <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0; text-transform: capitalize;">${opts.subject}
          </div>
          <table style="width:100%;background-color:#f6f9fc;padding:10px 0" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation">
              <tbody>
              <tr>
                  <td>
                  <div><!--[if mso | IE]>
                      <table role="presentation" width="100%" align="center" style="max-width:37.5em;margin:0 auto;background-color:#ffffff;border:1px solid #f0f0f0;width:600px;padding:45px;"><tr><td></td><td style="width:37.5em;background:#ffffff">
                  <![endif]--></div>
                  <div style="max-width:37.5em;margin:0 auto;background-color:#ffffff;border:1px solid #f0f0f0;width:600px;padding:45px"><img alt="Dropbox" src="${opts.host}/LOGOS/boom_logo.png" width="40" height="33" style="display:block;outline:none;border:none;text-decoration:none" />
                      <table style="width:100%" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                      <tbody>
                          <tr>
                          <td>
                              <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">${opts.name},</p>
                              <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">${opts.message}</p>
                              <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Happy Booming</p>
                          </td>
                          </tr>
                      </tbody>
                      </table>
                  </div>
                  <div><!--[if mso | IE]>
                  </td><td></td></tr></table>
                  <![endif]--></div>
                  </td>
              </tr>
              </tbody>
          </table>
  
      </html>`;
};
