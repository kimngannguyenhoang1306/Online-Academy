const sendGRIDkey ='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';
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(sendGRIDkey)

const SendEmail =  (link,receiver,otp) => {
    var emailText = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><a clicktracking=off href='+link+'>CLICK HERE TO CONFIRM YOUR EMAIL WITH OTP CODE</a><p>YOUR OTP: <strong>'+otp+'</strong></p></body></html>'
    sgMail.send({
        to: receiver,
        from:'18521512@gm.uit.edu.vn',
        subject:'[Online Academy] Confirm your email with OTP',
        html: emailText
    })
}

module.exports =  SendEmail;