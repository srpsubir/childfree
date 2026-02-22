

# Switch to Twilio Verify API

## Why

The current implementation manually generates OTP codes, hashes them, stores them in the database, and sends them via the Twilio Messages API. Twilio Verify is a purpose-built verification service that handles all of this automatically -- code generation, delivery, expiry, rate limiting, and verification -- with a single API call each way.

## What Changes

### 1. Update `send-otp` edge function
- Replace the manual code generation, hashing, database insert, and Twilio Messages API call with a single call to the **Twilio Verify API** (`POST /v2/Services/{ServiceSID}/Verifications`)
- This sends `{ To: phone, Channel: "sms" }` and Twilio handles everything else

### 2. Update `verify-otp` edge function
- Replace the database lookup and hash comparison with a single call to **Twilio Verify Check API** (`POST /v2/Services/{ServiceSID}/VerificationCheck`)
- This sends `{ To: phone, Code: code }` and Twilio returns a status of `approved` or `pending`

### 3. Add a new secret: `TWILIO_VERIFY_SERVICE_SID`
- You need to create a Verify Service in your Twilio Console (Explore Products > Verify > Create a Service)
- Copy the Service SID (starts with `VA...`) and provide it when prompted

### 4. Simplify the `otp_codes` table usage
- The `otp_codes` table is no longer needed for the core OTP flow since Twilio manages state
- It can be kept for audit logging or removed entirely

## Technical Details

**New send-otp flow:**
```
POST https://verify.twilio.com/v2/Services/{TWILIO_VERIFY_SERVICE_SID}/Verifications
Body: To=+49..., Channel=sms
Auth: Basic (AccountSID:AuthToken)
```

**New verify-otp flow:**
```
POST https://verify.twilio.com/v2/Services/{TWILIO_VERIFY_SERVICE_SID}/VerificationCheck
Body: To=+49..., Code=123456
Auth: Basic (AccountSID:AuthToken)
Response: { status: "approved" | "pending" }
```

No changes needed to `TWILIO_PHONE_NUMBER` -- Twilio Verify uses its own sender infrastructure, so the "From number" issue goes away entirely.

No frontend changes required -- the OTP screen already collects the phone number and 6-digit code.

