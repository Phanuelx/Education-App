import axios from "axios";

export const sendSms = async (phone, message) => {
  let data = JSON.stringify({
    Text: message,
    Number: phone,
    SenderId: "GURIAS",
    Tool: "API",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://restapi.smscountry.com/v0.1/Accounts/WjAO6OmxvILygdmHBoan/SMSes/",
    headers: {
      Authorization:
        "Basic V2pBTzZPbXh2SUx5Z2RtSEJvYW46QnlVRDJRc0NOVHBjbDFZMk1uWTVaODh3c0lqc2g1Um5QbEt0enBwaQ==",
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};
