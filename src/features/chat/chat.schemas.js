import { z } from "zod";

export const getContactsParamsSchema = z.object({
    schoolId: z.string().min(1),
    userId: z.string().min(1),
});

export const getContactsQuerySchema = z.object({
    role: z.string().min(1),
});

export const searchContactsParamsSchema = z.object({
    schoolId: z.string().min(1),
    userId: z.string().min(1),
});

export const searchContactsQuerySchema = z.object({
    role: z.string().min(1),
    q: z.string().optional(),
    classId: z.string().optional(),
});

export const getMessagesParamsSchema = z.object({
    schoolId: z.string().min(1),
    userId: z.string().min(1),
    contactId: z.string().min(1),
});

export const getMessagesQuerySchema = z.object({
    isGroup: z.enum(["true", "false"]).optional(),
});

export const getUnreadCountParamsSchema = z.object({
    schoolId: z.string().min(1),
    userId: z.string().min(1),
});

export const sendMessageBodySchema = z.object({
    schoolId: z.string().min(1),
    senderId: z.string().min(1),
    senderRole: z.string().min(1),
    receiverId: z.string().optional(),
    receiverRole: z.string().optional(),
    message: z.string().optional(),
    attachmentUrl: z.string().optional(),
    groupId: z.string().optional(),
});

export const markAsReadParamsSchema = z.object({
    schoolId: z.string().min(1),
    userId: z.string().min(1),
    contactId: z.string().min(1),
});

export const markAsReadQuerySchema = z.object({
    isGroup: z.enum(["true", "false"]).optional(),
});

export const createGroupBodySchema = z.object({
    schoolId: z.string().min(1),
    name: z.string().min(1),
    createdBy: z.string().min(1),
    members: z.array(z.string()).default([]),
});

export const addGroupMembersParamsSchema = z.object({
    groupId: z.string().min(1),
});

export const addGroupMembersBodySchema = z.object({
    members: z.array(z.string()),
});

export const getGroupMembersParamsSchema = z.object({
    groupId: z.string().min(1),
});

export const removeGroupMemberParamsSchema = z.object({
    groupId: z.string().min(1),
    userId: z.string().min(1),
});

export const updatePreferencesBodySchema = z.object({
    userId: z.string().min(1),
    contactId: z.string().min(1),
    action: z.enum([
        "pin",
        "unpin",
        "clear",
        "delete",
    ]),
});

export const printConversationParamsSchema = z.object({
    schoolId: z.string().min(1),
    user1Id: z.string().min(1),
    user2Id: z.string().min(1),
});