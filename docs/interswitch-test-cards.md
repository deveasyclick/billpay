Here are some of the test cards listed in the Interswitch Group documentation (for use in sandbox/testing mode) with their brand, PAN, expiry, CVV, PIN/OTP and scenario:

| Brand      | PAN                 | Expiry | CVV | PIN  | OTP    | Scenario                               |
| ---------- | ------------------- | ------ | --- | ---- | ------ | -------------------------------------- |
| Verve      | 5061050254756707864 | 06/26  | 111 | 1111 | —      | Success                                |
| Verve      | 5060990580000217499 | 03/50  | 111 | 1111 | —      | Success                                |
| VISA       | 4000000000002503    | 03/50  | 11  | 1111 | —      | Success                                |
| Mastercard | 5123450000000008    | 01/39  | 100 | 1111 | 123456 | Success                                |
| Verve      | 5061830100001895    | 01/40  | 111 | 1111 | 123456 | Failure – Timeout calling issuing bank |
| Verve      | 5060990580000000390 | 03/50  | 111 | 1111 | 123456 | Failure – Insufficient Funds           |
| Verve      | 5612330000000000412 | 03/50  | 111 | 1111 | 123456 | Failure – No card Record               |