import { Router } from "express";
import { authentication } from "../../middleware/auth.middleware.js";
import { findChatHistory, findOneChat } from "./services/chat.services.js";
const router = Router();

router.get("/:destId", authentication(), findChatHistory);
export default router;
