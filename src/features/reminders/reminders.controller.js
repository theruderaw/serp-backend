import remindersService from "./reminders.service.js";

export async function getReminders(req, res, next) {
    try {
        const data = await remindersService.getReminders(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function createReminder(req, res, next) {
    try {
        const data = await remindersService.createReminder(
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function markReminderRead(req, res, next) {
    try {
        const data = await remindersService.markReminderRead(
            req.params.id
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}