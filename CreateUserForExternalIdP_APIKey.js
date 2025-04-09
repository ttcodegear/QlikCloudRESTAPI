const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const tenant = "https://xxx.yy.qlikcloud.com";
const tenantId = "uSLOdEW8uVUDTCSNq5th2m......";

async function getAccessToken() {
  const apikey = "eyJhbGciOiJFU....";
  return apikey;
}

async function createOneUser(access_token) {
  const new_user = {
    name: "ttcodegearさん", // 仮の名前なので任意の文字列(ログイン時に更新)
    email: "xxxxxx@yahoo.co.jp",
    status: "active",
    subject: uuidv4(), // 仮のIdPサブジェクトで任意の一意の文字列(ログイン時に更新)
    tenantId: `${tenantId}`, // テナントID
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify(new_user),
  }
  const response = await fetch(tenant + "/api/v1/users", options);
  if(response?.ok) {
    const created_user = await response.json();
    return created_user; // {"id":"6745...","tenantId":"uSL...","status":"active","subject":"c5103c68-d2...","name":"ttcodegearさん","email":"xxxxxx@yahoo.co.jp","roles":[],...}
  }
  return null;
}

async function addLicenseToUser(access_token, subject, type) {
  const licenses = {
    add: [{
      subject: `${subject}`, // ユーザーのIdPサブジェクト
      type: `${type}`, // professional,analyzer,fullUser,basicUser
    }],
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify(licenses),
  }
  const response = await fetch(tenant + "/api/v1/licenses/assignments/actions/add", options);
  if(response?.ok) {
    const added_licenses = await response.json();
    return added_licenses.data; // {"data":[{"type":"fullUser","subject":"c5103c68-d2...","status":201}]}
  }
  return null;
}

async function addUserToSpaceAsProducer(access_token, userid, spaceid) {
  const add_info = {
    type: "user", // user,group
    roles: ["producer"], // consumer,contributor,dataconsumer,datapreview,facilitator,operator,producer,publisher,basicconsumer,codeveloper
    assigneeId: `${userid}`, // ユーザーのID
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify(add_info),
  }
  const response = await fetch(tenant + "/api/v1/spaces/" + spaceid +"/assignments", options);
  if(response?.ok) {
    const assignment = await response.json();
    return assignment;
  }
  return null;
}

async function inviteOneUser() {
  const options = {
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    requireTLS: true,
    tls: {
      rejectUnauthorized: true,
    },
    auth: {
      user: 'xxxxxx@zoho.com',
      pass: 'xxxxxx',
    },
  };

  const mail = {
    from: "xxxxxx@zoho.com",
    to: "xxxxxx@yahoo.co.jp",
    subject: "Qlik Cloudへようこそ",
    //text: "Qlik Cloudへようこそ(TEXT)",
    html: '<p><a href="https://xxx.yy.qlikcloud.com">Qlik Cloudへようこそ(HTML)</a></p>',
  };

  try {
    const smtp = nodemailer.createTransport(options);
    const result = await smtp.sendMail(mail);
    return result;
  }
  catch(error) {
    return error;
  }
}

void async function main() {
  const access_token = await getAccessToken();
  if(access_token==null){
    console.log("Error: access token");
    return;
  }
  console.log(access_token);

  const created_user = await createOneUser(access_token);
  if(created_user==null){
    console.log("Error: create user");
    return;
  }
  console.log(created_user);

  const added_licenses = await addLicenseToUser(access_token, created_user.subject, "fullUser");
  if(added_licenses==null){
    console.log("Error: add licenses");
    return;
  }
  console.log(added_licenses);

  const assignment = await addUserToSpaceAsProducer(access_token, created_user.id, "67458bf59a0d38e6d4f9be5b");
  if(assignment==null){
    console.log("Error: add user to space");
    return;
  }
  console.log(assignment);

  const sendmail = await inviteOneUser();
  console.log(sendmail);
}();
