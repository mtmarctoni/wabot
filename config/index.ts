import dotenv from "dotenv";
dotenv.config();

const {
  PORT: port = 3001,
  MY_NUMBER: me = "",
  SENDERS_DATA: sendersData = "{}",
  AZURE_SUBSCRIPTION_KEY1_WABOT: subscriptionKey = "",
  AZURE_SERVICE_REGION_WABOT: serviceRegion = "",
} = process.env;

const senders = JSON.parse(sendersData);

export const config = {
  port,
  me,
  senders,
  subscriptionKey,
  serviceRegion,
};
