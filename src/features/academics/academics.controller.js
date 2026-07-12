import academicService from './academics.service.js';

export async function getClassesFlat(req, res) {
    try {
        const rows = await academicService.getClassesFlat(req.params.schoolId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getClassesHierarchy(req, res) {
    try {
        const hierarchy = await academicService.getClassesHierarchy(req.params.schoolId);
        res.json(hierarchy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function saveClassHierarchy(req, res) {
    try {
        await academicService.saveClassHierarchy(req.params.schoolId, req.body);
        res.json({ message: 'Class hierarchy saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteClass(req, res) {
    try {
        await academicService.deleteClass(req.params.schoolId, req.params.className);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getStudentAttendance(req, res) {
    try {
        const rows = await academicService.getStudentAttendance(req.params.schoolId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getTodayAttendanceSummary(req, res) {
    try {
        const summary = await academicService.getTodayAttendanceSummary(req.params.schoolId);
        console.log(summary)
        res.json(summary);
    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function getMarks(req, res) {
    try {
        const rows = await academicService.getMarks(req.params.studentId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getHomework(req, res) {
    try {
        const rows = await academicService.getHomework(req.params.classId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}