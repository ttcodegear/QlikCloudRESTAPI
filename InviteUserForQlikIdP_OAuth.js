const tenant = "https://xxx.yy.qlikcloud.com";

async function getAccessToken() {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      client_id: "dc7755d243d14d646abcb1f......",
      client_secret: "d698271860ff6a1fbbfe70c946cd7d61..........",
      grant_type: "client_credentials", // 固定値
      scope: "admin_classic", // 管理コンソールのOAuthの範囲(テナントにフルの管理者アクセス)
    }),
  }
  const response = await fetch(tenant + "/oauth/token", options);
  if(response?.ok) {
    const token_info = await response.json();
    return token_info.access_token; // eyJhbGciOiJFUzM4NCIs...
  }
  return null;
}

async function inviteOneUser(access_token) {
  const new_users = {
    invitees: [{
      name: "ttcodegearさん", // 仮の名前なので任意の文字列(ログイン時に更新)
      email: "xxxxxx@yahoo.co.jp",
      resend: false, // 招待メールを再送信するならtrue
      language: "ja", // 招待メールが日本語で届く
    }],
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${access_token}`,
    },
    body: JSON.stringify(new_users),
  }
  const response = await fetch(tenant + "/api/v1/users/actions/invite", options);
  if(response?.ok) {
    const created_users = await response.json();
    return created_users.data; // {"data":[{"status":"ok","email":"xxxxxx@yahoo.co.jp","subject":"auth0|a08...","userId":"6745..."}]}
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
    return added_licenses.data; // {"data":[{"type":"analyzer","subject":"auth0|a08...","status":201}]}
  }
  return null;
}

async function addUserToSpaceAsConsumer(access_token, userid, spaceid) {
  const add_info = {
    type: "user", // user,group
    roles: ["consumer"], // consumer,contributor,dataconsumer,datapreview,facilitator,operator,producer,publisher,basicconsumer,codeveloper
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

void async function main() {
  const access_token = await getAccessToken();
  if(access_token==null){
    console.log("Error: access token");
    return;
  }
  console.log(access_token);

  const created_users = await inviteOneUser(access_token);
  if(created_users==null){
    console.log("Error: create users");
    return;
  }
  console.log(created_users);

  const added_licenses = await addLicenseToUser(access_token, created_users[0].subject, "analyzer");
  if(added_licenses==null){
    console.log("Error: add licenses");
    return;
  }
  console.log(added_licenses);

  const assignment = await addUserToSpaceAsConsumer(access_token, created_users[0].userId, "67457898f38c9b08992c6d3c");
  if(assignment==null){
    console.log("Error: add user to space");
    return;
  }
  console.log(assignment);
}();
