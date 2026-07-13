import * as chatService from "./service/index.js";

export async function getContacts(req, res, next) {
    try {
        const data = await contactService.getContacts(
            req.params.schoolId,
            req.params.userId,
            req.query.role
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function searchContacts(req, res, next) {
    try {
        const data = await contactService.searchContacts(
            req.params.schoolId,
            req.params.userId,
            req.query.role,
            req.query.q,
            req.query.classId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getMessages(req, res, next) {
    try {
        const data = await messageService.getMessages(
            req.params.schoolId,
            req.params.userId,
            req.params.contactId,
            req.query.isGroup === "true"
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getUnreadCount(req, res, next) {
    try {
        const data = await contactService.getUnreadCount(
            req.params.schoolId,
            req.params.userId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function sendMessage(req, res, next) {
    try {
        const data = await messageService.sendMessage(req.body);

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function markAsRead(req, res, next) {
    try {
        const data = await messageService.markAsRead(
            req.params.schoolId,
            req.params.userId,
            req.params.contactId,
            req.query.isGroup === "true"
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function createGroup(req, res, next) {
    try {
        const data = await groupService.createGroup(req.body);

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function addGroupMembers(req, res, next) {
    try {
        const data = await groupService.addGroupMembers(
            req.params.groupId,
            req.body.members
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getGroupMembers(req, res, next) {
    try {
        const data = await groupService.getGroupMembers(
            req.params.groupId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function removeGroupMember(req, res, next) {
    try {
        const data = await groupService.removeGroupMember(
            req.params.groupId,
            req.params.userId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function updatePreferences(req, res, next) {
    try {
        const data = await preferenceService.updatePreferences(
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function printConversation(req, res, next) {
    try {
        const data = await reportService.printConversation(
            req.params.schoolId,
            req.params.user1Id,
            req.params.user2Id
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}