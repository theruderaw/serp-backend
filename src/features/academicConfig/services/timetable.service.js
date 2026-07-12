import pool from "../../../config/db.js";

export async function getTeacherTimetable(schoolId, teacherId) {
    const { rows } = await pool.query(
        `SELECT tc.*, cc.classname
         FROM timetable_config tc
         JOIN class_config cc ON tc.classconfigid = cc.id
         WHERE tc.schoolid = $1`,
        [schoolId]
    );

    const teacherSchedule = {};
    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    DAYS.forEach((d) => (teacherSchedule[d] = {}));

    rows.forEach((row) => {
        let data = typeof row.timetabledata === "string" ? JSON.parse(row.timetabledata) : row.timetabledata;
        if (!data) return;
        Object.keys(data).forEach((day) => {
            if (teacherSchedule[day]) {
                Object.keys(data[day]).forEach((slot) => {
                    const slotData = data[day][slot];
                    if (slotData && String(slotData.teacherId) === String(teacherId)) {
                        teacherSchedule[day][slot] = {
                            subjectName: slotData.subjectName,
                            className: row.classname,
                            sectionName: row.sectionname
                        };
                    }
                });
            }
        });
    });

    const metadata = rows.length > 0 ? {
        periodsCount: rows[0].periodscount,
        startTime: rows[0].starttime,
        periodMinutes: rows[0].periodminutes,
        lunchMinutes: rows[0].lunchminutes,
        lunchAfterPeriod: rows[0].lunchafterperiod,
        hasPrayer: rows[0].hasprayer,
        prayerStartTime: rows[0].prayerstarttime,
        prayerDuration: rows[0].prayerduration,
        prayerName: rows[0].prayername,
        prayerDisplayMode: rows[0].prayerdisplaymode,
        session: rows[0].session,
        showLunchInColumn: rows[0].showlunchincolumn
    } : {};

    return { schedule: teacherSchedule, metadata };
}

export async function getTimetables(schoolId) {
    const { rows } = await pool.query(
        `SELECT t.*, c.classname, c.stream
         FROM timetable_config t
         JOIN class_config c ON t.classconfigid = c.id
         WHERE t.schoolid = $1`,
        [schoolId]
    );

    rows.forEach((r) => {
        try { r.timetabledata = typeof r.timetabledata === "string" ? JSON.parse(r.timetabledata) : r.timetabledata; } catch (e) { r.timetabledata = {}; }
    });

    return rows;
}

export async function getTimetableBySection(schoolId, classConfigId, section) {
    const { rows } = await pool.query(
        `SELECT * FROM timetable_config
         WHERE schoolid = $1 AND classconfigid = $2 AND sectionname = $3`,
        [schoolId, classConfigId, section]
    );

    if (rows.length === 0) return null;

    const r = rows[0];
    try { r.timetabledata = typeof r.timetabledata === "string" ? JSON.parse(r.timetabledata) : r.timetabledata; } catch (e) { r.timetabledata = {}; }
    return r;
}

export async function upsertTimetable(body) {
    const {
        schoolId, classConfigId, sectionName, periodsCount, startTime, periodMinutes,
        lunchMinutes, lunchAfterPeriod, hasPrayer, prayerStartTime, prayerDuration,
        prayerName, prayerDisplayMode, session, showLunchInColumn, timetableData
    } = body;

    const { rows: existing } = await pool.query(
        `SELECT id FROM timetable_config
         WHERE schoolid = $1 AND classconfigid = $2 AND sectionname = $3`,
        [schoolId, classConfigId, sectionName]
    );

    if (existing.length > 0) {
        await pool.query(
            `UPDATE timetable_config
             SET periodscount = $1, starttime = $2, periodminutes = $3, lunchminutes = $4,
                 lunchafterperiod = $5, hasprayer = $6, prayerstarttime = $7, prayerduration = $8,
                 prayername = $9, prayerdisplaymode = $10, session = $11, showlunchincolumn = $12,
                 timetabledata = $13
             WHERE id = $14`,
            [
                periodsCount, startTime, periodMinutes, lunchMinutes, lunchAfterPeriod,
                hasPrayer ?? true, prayerStartTime || "07:40", prayerDuration || 20,
                prayerName || "Assembly / Prayer", prayerDisplayMode || "column",
                session || "2024-2025", showLunchInColumn ?? true,
                JSON.stringify(timetableData || {}), existing[0].id
            ]
        );
        return { id: existing[0].id, message: "Timetable updated" };
    }

    const { rows } = await pool.query(
        `INSERT INTO timetable_config
            (schoolid, classconfigid, sectionname, periodscount, starttime, periodminutes,
             lunchminutes, lunchafterperiod, hasprayer, prayerstarttime, prayerduration,
             prayername, prayerdisplaymode, session, showlunchincolumn, timetabledata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         RETURNING id`,
        [
            schoolId, classConfigId, sectionName, periodsCount, startTime, periodMinutes,
            lunchMinutes, lunchAfterPeriod, hasPrayer ?? true, prayerStartTime || "07:40",
            prayerDuration || 20, prayerName || "Assembly / Prayer", prayerDisplayMode || "column",
            session || "2024-2025", showLunchInColumn ?? true, JSON.stringify(timetableData || {})
        ]
    );

    return { id: rows[0].id, message: "Timetable created" };
}

// ═══════════════ AUTO GENERATE TIMETABLES ═══════════════

export async function autoGenerateTimetables(body) {
    const {
        schoolId, periodsCount, startTime, periodMinutes, lunchMinutes, lunchAfterPeriod,
        hasPrayer = true, prayerStartTime = "07:40", prayerDuration = 20,
        prayerName = "Assembly / Prayer", prayerDisplayMode = "column", session = "2024-2025",
        showLunchInColumn = true, selectedClasses = [], globalSubjectRules = [], noLabsFirstPeriod = false
    } = body;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Fetch ALL class configs for this school
        const { rows: allClasses } = await client.query(
            `SELECT * FROM class_config WHERE schoolid = $1`,
            [schoolId]
        );
        allClasses.forEach((c) => {
            try { c.subjects = typeof c.subjects === "string" ? JSON.parse(c.subjects) : c.subjects; } catch (e) { c.subjects = []; }
            try { c.sections = typeof c.sections === "string" ? JSON.parse(c.sections) : c.sections; } catch (e) { c.sections = ["A"]; }
        });

        // 2. Filter to only selected class-sections (if provided)
        const toGenerate = selectedClasses.length > 0
            ? selectedClasses.map((s) => {
                const cls = allClasses.find((c) => String(c.id) === String(s.classConfigId));
                return cls ? { ...cls, targetSection: s.section } : null;
            }).filter(Boolean)
            : allClasses.map((c) => ({ ...c, targetSection: (c.sections || ["A"])[0] }));

        // 3. Fetch teachers and build subject → teachers map (also match by specialization)
        const { rows: allTeachers } = await client.query(
            `SELECT id, name, qualification AS specialization
             FROM employees
             WHERE schoolid = $1 AND role = 'Teacher'`,
            [schoolId]
        );

        const subjectTeachers = {};
        for (const cls of allClasses) {
            for (const sub of cls.subjects) {
                const key = sub.name.toLowerCase().trim();
                if (!subjectTeachers[key]) subjectTeachers[key] = new Set();
                if (sub.teacherId) subjectTeachers[key].add(String(sub.teacherId));
            }
        }
        for (const teacher of allTeachers) {
            if (teacher.specialization) {
                let specs = [];
                try {
                    specs = typeof teacher.specialization === "string" && teacher.specialization.startsWith("[")
                        ? JSON.parse(teacher.specialization)
                        : [teacher.specialization];
                } catch (e) { specs = [teacher.specialization]; }

                for (const spec of specs) {
                    if (!spec) continue;
                    const specKey = String(spec).toLowerCase().trim();
                    for (const subKey of Object.keys(subjectTeachers)) {
                        if (subKey.includes(specKey) || specKey.includes(subKey.split(" ")[0])) {
                            subjectTeachers[subKey].add(String(teacher.id));
                        }
                    }
                    if (!subjectTeachers[specKey]) subjectTeachers[specKey] = new Set();
                    subjectTeachers[specKey].add(String(teacher.id));
                }
            }
        }
        const subTeachers = {};
        for (const [k, v] of Object.entries(subjectTeachers)) subTeachers[k] = [...v];

        // 4. Delete only timetables for the selected class-sections
        if (selectedClasses.length > 0) {
            for (const s of selectedClasses) {
                await client.query(
                    `DELETE FROM timetable_config WHERE schoolid = $1 AND classconfigid = $2 AND sectionname = $3`,
                    [schoolId, s.classConfigId, s.section]
                );
            }
        } else {
            await client.query(`DELETE FROM timetable_config WHERE schoolid = $1`, [schoolId]);
        }

        // 5. Conflict-free generation
        const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const totalSlots = periodsCount * DAYS.length;

        const busyTeachers = {};
        DAYS.forEach((d) => {
            busyTeachers[d] = {};
            for (let p = 1; p <= periodsCount; p++) busyTeachers[d][`p${p}`] = new Set();
        });

        const generatedTimetables = [];

        for (const item of toGenerate) {
            const section = item.targetSection;
            const timetable = {};
            DAYS.forEach((d) => { timetable[d] = {}; });

            if (!item.subjects || item.subjects.length === 0) {
                generatedTimetables.push({ cls: item, section, data: timetable });
                continue;
            }

            const subjectTargets = {};
            for (const sub of item.subjects) {
                let maxTarget = Math.ceil(totalSlots / item.subjects.length);
                const subNameLower = sub.name.toLowerCase();
                for (const rule of globalSubjectRules) {
                    if (rule.keyword && subNameLower.includes(rule.keyword.toLowerCase())) {
                        maxTarget = parseInt(rule.maxPeriodsPerWeek) || 1;
                        break;
                    }
                }
                subjectTargets[sub.name] = maxTarget;
            }

            const subjectCount = {};
            item.subjects.forEach((s) => { subjectCount[s.name] = 0; });

            for (const day of DAYS) {
                for (let p = 1; p <= periodsCount; p++) {
                    const slotKey = `p${p}`;

                    const available = item.subjects.filter((s) => subjectCount[s.name] < subjectTargets[s.name]);
                    const prioritized = (available.length > 0 ? available : item.subjects)
                        .sort((a, b) => subjectCount[a.name] - subjectCount[b.name]);

                    let placed = false;
                    for (const sub of prioritized) {
                        const key = sub.name.toLowerCase().trim();

                        let skipDueToRule = false;
                        if (slotKey === "p1" && noLabsFirstPeriod && key.includes("lab")) {
                            skipDueToRule = true;
                        }

                        if (!skipDueToRule && slotKey === "p1") {
                            for (const rule of globalSubjectRules) {
                                if (rule.keyword && key.includes(rule.keyword.toLowerCase()) && rule.notFirstPeriod) {
                                    skipDueToRule = true;
                                    break;
                                }
                            }
                        }

                        if (!skipDueToRule) {
                            for (const rule of globalSubjectRules) {
                                if (rule.keyword && key.includes(rule.keyword.toLowerCase()) && rule.placement && rule.placement !== "any") {
                                    const placement = rule.placement;
                                    const isBeforeLunch = p <= lunchAfterPeriod;
                                    const isAfterLunch = p > lunchAfterPeriod;

                                    if (placement === "beforeLunch" && !isBeforeLunch) skipDueToRule = true;
                                    else if (placement === "afterLunch" && !isAfterLunch) skipDueToRule = true;
                                    else if (placement === "justBeforeLunch" && p !== lunchAfterPeriod) skipDueToRule = true;
                                    else if (placement === "justAfterLunch" && p !== lunchAfterPeriod + 1) skipDueToRule = true;

                                    if (skipDueToRule) break;
                                }
                            }
                        }

                        if (skipDueToRule) continue;

                        let candidatePool = [];
                        if (sub.sectionTeachers && sub.sectionTeachers[section]) {
                            candidatePool = [String(sub.sectionTeachers[section])];
                        } else {
                            candidatePool = subTeachers[key] || (sub.teacherId ? [String(sub.teacherId)] : []);
                        }

                        for (const tid of candidatePool) {
                            if (!busyTeachers[day][slotKey].has(tid)) {
                                timetable[day][slotKey] = { subjectName: sub.name, teacherId: tid };
                                busyTeachers[day][slotKey].add(tid);
                                subjectCount[sub.name]++;
                                placed = true;
                                break;
                            }
                        }
                        if (placed) break;

                        if (!placed && candidatePool.length === 0) {
                            timetable[day][slotKey] = { subjectName: sub.name, teacherId: "" };
                            subjectCount[sub.name]++;
                            placed = true;
                            break;
                        }
                    }

                    if (!placed) {
                        timetable[day][slotKey] = { subjectName: "Free Period", teacherId: "" };
                    }
                }
            }
            generatedTimetables.push({ cls: item, section, data: timetable });
        }

        // 6. Insert
        for (const { cls, section, data } of generatedTimetables) {
            await client.query(
                `INSERT INTO timetable_config
                    (schoolid, classconfigid, sectionname, periodscount, starttime, periodminutes,
                     lunchminutes, lunchafterperiod, hasprayer, prayerstarttime, prayerduration,
                     prayername, prayerdisplaymode, session, showlunchincolumn, timetabledata)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
                [
                    schoolId, cls.id, section, periodsCount, startTime, periodMinutes,
                    lunchMinutes, lunchAfterPeriod, hasPrayer, prayerStartTime, prayerDuration,
                    prayerName, prayerDisplayMode, session, showLunchInColumn, JSON.stringify(data)
                ]
            );
        }

        await client.query("COMMIT");

        return { message: "Timetables generated!", totalClasses: generatedTimetables.length };
    } catch (err) {
        try { await client.query("ROLLBACK"); } catch (e) {}
        throw err;
    } finally {
        client.release();
    }
}

export async function deleteTimetable(id) {
    await pool.query(`DELETE FROM timetable_config WHERE id = $1`, [id]);
    return { message: "Timetable deleted" };
}
