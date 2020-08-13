const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'quintinsheridan@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you are liking the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'quintinsheridan@gmail.com',
        subject: 'Cancellation Confirmation',
        text: `${name} your account has succesfully been removed.  
            Please let us know what could have been done to improve the service.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}