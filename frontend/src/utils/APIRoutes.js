export const host =
  "https://ec2-15-207-21-133.ap-south-1.compute.amazonaws.com/";
export const registerRoute = `${host}/api/auth/register`;
export const loginRoute = `${host}/api/auth/login`;
export const allUsersRoute = `${host}/api/auth/users`;
export const singleUserRoute = `${host}/api/auth/user`;
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const getAllMessageRoute = `${host}/api/messages/getmsg`;
export const getAllPendingRoutes = `${host}/api/chat/getRequests`;
export const createChatRoute = `${host}/api/chat/create`;
export const startChatRoute = `${host}/api/chat/start`;
export const getChatRoute = `${host}/api/chat`;
export const completeChatRoute = `${host}/api/chat/complete`;
export const gpttextComplete = `${host}/api/gpt`;
