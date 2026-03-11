const { eq } = require("drizzle-orm");
const { users } = require("../schema");
const { twilioClient, TWILIO_PHONE_NUMBER } = require("../services/twilio");

const maskPhone = (phone) =>
  phone.slice(0, -4).replace(/\d/g, "X") + phone.slice(-4);

const sendTaskAssignmentSMS = async (taskId, userId, orgId) => {
  console.log(
    `[notifications] Processing SMS for task_id=${taskId} user_id=${userId} org_id=${orgId}`
  );

  // Look up the user's phone number
  console.log(`[notifications] Looking up phone number for user ${userId}`);
  const user = await db
    .select({ phone_number: users.phone_number })
    .from(users)
    .where(eq(users.id, userId))
    .then(([r]) => r);

  if (!user?.phone_number) {
    console.log(
      `[notifications] No phone number found for user ${userId}, skipping SMS`
    );
    return { sent: false, reason: "no_phone" };
  }

  console.log(
    `[notifications] Sending SMS to ${maskPhone(user.phone_number)} for user ${userId}`
  );
  await twilioClient.messages.create({
    to: user.phone_number,
    from: TWILIO_PHONE_NUMBER,
    body: `You've been assigned a new task. Check your dashboard for details.`,
  });

  console.log(`[notifications] SMS sent successfully to user ${userId}`);
  return { sent: true };
};

module.exports = { sendTaskAssignmentSMS };
