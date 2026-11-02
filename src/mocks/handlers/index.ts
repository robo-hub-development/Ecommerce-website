import { accountHandlers } from "@/mocks/handlers/account";
import { catalogHandlers } from "@/mocks/handlers/catalog";
import { contentHandlers } from "@/mocks/handlers/content";

export const handlers = [...catalogHandlers, ...contentHandlers, ...accountHandlers];
