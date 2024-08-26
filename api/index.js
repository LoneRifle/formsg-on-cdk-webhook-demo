const express = require('express')

const app = express()

// This is where your domain is hosted, and should match
// the URI supplied to FormSG in the form dashboard

const formsg = require('@opengovsg/formsg-sdk')({
  mode: 'development',
  verificationOptions: {
    publicKey: 'Tl5gfszlKcQj99/0uafLwVpT6JAu4C0dHGvLq1cHzFE=',
  },
})

app.post(
  '/submissions',
  // Endpoint authentication by verifying signatures
  function (req, res, next) {
    try {
      formsg.webhooks.authenticate(req.get('X-FormSG-Signature'), `https://${req.hostname}${req.url}`)
      // Continue processing the POST body
      return next()
    } catch (e) {
      console.error(e)
      return res.sendStatus(401)
    }
  },
  // Parse JSON from raw request body
  express.json(),
  // Decrypt the submission
  async function (req, res) {
    // If `verifiedContent` is provided in `req.body.data`, the return object
    // will include a verified key.
    const submission = formsg.crypto.decrypt(process.env.FORMSG_SECRET_KEY, req.body.data)

    // If the decryption failed, submission will be `null`.
    if (submission) {
      // Continue processing the submission
      console.log(submission)
      res.json(submission)
    } else {
      res.sendStatus(400)
    }
  }
)

module.exports = app
