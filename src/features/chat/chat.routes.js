import express from "express";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import * as chatController from "./chat.controller.js";

import {
    getContactsParamsSchema,
    getContactsQuerySchema,

    searchContactsParamsSchema,
    searchContactsQuerySchema,

    getMessagesParamsSchema,
    getMessagesQuerySchema,

    getUnreadCountParamsSchema,

    sendMessageBodySchema,

    markAsReadParamsSchema,
    markAsReadQuerySchema,

    createGroupBodySchema,

    addGroupMembersParamsSchema,
    addGroupMembersBodySchema,

    getGroupMembersParamsSchema,

    removeGroupMemberParamsSchema,

    updatePreferencesBodySchema,

    printConversationParamsSchema,
} from "./chat.schemas.js";

const router = express.Router();

router.get(
    "/contacts/:schoolId/:userId",
    auth,
    validate({
        params: getContactsParamsSchema,
        query: getContactsQuerySchema,
    }),
    chatController.getContacts
);

router.get(
    "/search/:schoolId/:userId",
    auth,
    validate({
        params: searchContactsParamsSchema,
        query: searchContactsQuerySchema,
    }),
    chatController.searchContacts
);

router.get(
    "/messages/:schoolId/:userId/:contactId",
    auth,
    validate({
        params: getMessagesParamsSchema,
        query: getMessagesQuerySchema,
    }),
    chatController.getMessages
);

router.get(
    "/unread/:schoolId/:userId",
    auth,
    validate({
        params: getUnreadCountParamsSchema,
    }),
    chatController.getUnreadCount
);

router.post(
    "/send",
    auth,
    validate({
        body: sendMessageBodySchema,
    }),
    chatController.sendMessage
);

router.put(
    "/read/:schoolId/:userId/:contactId",
    auth,
    validate({
        params: markAsReadParamsSchema,
        query: markAsReadQuerySchema,
    }),
    chatController.markAsRead
);

router.post(
    "/group",
    auth,
    validate({
        body: createGroupBodySchema,
    }),
    chatController.createGroup
);

router.post(
    "/group/:groupId/members",
    auth,
    validate({
        params: addGroupMembersParamsSchema,
        body: addGroupMembersBodySchema,
    }),
    chatController.addGroupMembers
);

router.get(
    "/group/:groupId/members",
    auth,
    validate({
        params: getGroupMembersParamsSchema,
    }),
    chatController.getGroupMembers
);

router.delete(
    "/group/:groupId/members/:userId",
    auth,
    validate({
        params: removeGroupMemberParamsSchema,
    }),
    chatController.removeGroupMember
);

router.post(
    "/preferences",
    auth,
    validate({
        body: updatePreferencesBodySchema,
    }),
    chatController.updatePreferences
);

router.get(
    "/print/:schoolId/:user1Id/:user2Id",
    auth,
    validate({
        params: printConversationParamsSchema,
    }),
    chatController.printConversation
);

export default router;