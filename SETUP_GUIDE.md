# Setup Guide: Anticipate Interview Questions

## Email Notifications Setup (Mailchimp Integration)

The application uses Mailchimp to send email notifications when users submit the landing page form and complete the intake form. To enable email notifications, you need to configure the following environment variables in your Supabase project.

### Step 1: Get Mailchimp API Credentials

1. Log in to your [Mailchimp account](https://mailchimp.com)
2. Go to **Profile > Extras > API keys**
3. Create a new API key or use an existing one
4. Copy the API key (format: `xxxxxxxxxxxxxxxxxxxxxxxxx-us1`)

### Step 2: Get Mailchimp Audience ID

1. In Mailchimp, go to **Audience > All contacts**
2. Click on **Settings > Audience name and defaults**
3. Copy the **Audience ID** (format: `xxxxxxxxxx`)

### Step 3: Configure Supabase Environment Variables

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings > Environment Variables**
4. Add the following variables:

```
MAILCHIMP_API_KEY=your_actual_mailchimp_api_key
MAILCHIMP_AUDIENCE_ID=your_actual_audience_id
```

### Step 4: Deploy Functions (if needed)

If you're working locally or need to redeploy functions:

```bash
supabase functions deploy send-order-confirmation
supabase functions deploy send-intake-notifications
```

## Email Automation Flow

### When a user purchases:
1. **Order Confirmation Email** is sent via `send-order-confirmation` function
2. Customer is added to Mailchimp audience with tags: `order_confirmation`, `anticipate_questions`
3. Notification is sent to `andrew@nailyourjobinterview.com`

### When a user completes intake form:
1. **Intake Completion Email** is sent via `send-intake-notifications` function  
2. Customer information is updated in Mailchimp with intake details
3. Notification is sent to `andrew@nailyourjobinterview.com` with form details

## Troubleshooting

### Email notifications not working?

1. **Check Environment Variables**: Ensure `MAILCHIMP_API_KEY` and `MAILCHIMP_AUDIENCE_ID` are set in Supabase
2. **Check Function Logs**: Go to Supabase Dashboard > Functions > Logs to see error details
3. **Verify API Key**: Make sure the Mailchimp API key is valid and has proper permissions
4. **Check Audience ID**: Verify the audience ID exists and is accessible

### Common Error Messages:

- `"WARNING: No Mailchimp API key found, skipping email"` - Environment variable not set
- `"Mailchimp API error"` - Invalid API key or audience ID
- `"Order not found"` - Payment session ID doesn't match any orders in database

### Testing the Integration:

1. Complete a test purchase using Stripe test mode
2. Check Supabase function logs for any errors
3. Verify customer appears in Mailchimp audience
4. Confirm emails are being triggered (check Mailchimp campaign reports)

## Support

If you encounter issues with the email integration, contact:
- **Email**: andrew@nailyourjobinterview.com
- **Include**: Function logs, error messages, and session IDs for faster resolution