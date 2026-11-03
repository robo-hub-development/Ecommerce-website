import { accountHandlers } from "@/mocks/handlers/account";
import { contentHandlers } from "@/mocks/handlers/content";

export const handlers = [...contentHandlers, ...accountHandlers];
