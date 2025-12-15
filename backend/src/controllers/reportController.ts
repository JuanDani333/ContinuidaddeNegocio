import { Request, Response } from "express";
import ExcelJS from "exceljs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export const exportReport = async (req: Request, res: Response) => {
  try {
    // 1. Fetch Data
    let query = supabase
      .from("attempts")
      .select(
        `
        raw_attempt,
        unit_time_seconds,
        total_time_seconds,
        question_id,
        calculated_score,
        timestamp,
        session_id,
        user_id,
        users ( name, email ),
        courses ( id, name ),
        skills ( full_name )
      `
      )
      .order("timestamp", { ascending: false });

    // Filter by courseId if provided
    const { courseId } = req.query;
    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data: attempts, error } = await query;

    if (error) throw error;

    const workbook = new ExcelJS.Workbook();

    // Helper to format seconds to HH:mm:ss
    const formatSeconds = (seconds: number) => {
      if (!seconds && seconds !== 0) return "00:00:00";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // 2. Custom Report Logic: Summary vs Detailed
    if (!courseId) {
      // === GLOBAL SUMMARY REPORT ===
      const worksheet = workbook.addWorksheet("Resumen Global");
      worksheet.columns = [
        { header: "Nombre del Curso", key: "courseName", width: 40 },
        { header: "Tiempo Promedio Curso", key: "avgCourseTime", width: 25 },
        { header: "Promedio Intentos (Curso)", key: "avgAttempts", width: 25 },
        {
          header: "Tiempo Promedio (Pregunta)",
          key: "avgQuestTime",
          width: 25,
        },
        { header: "Nota Global", key: "globalScore", width: 15 },
      ];

      // Group by Course
      const attemptsByCourse = (attempts || []).reduce(
        (acc: any, curr: any) => {
          const cId = curr.courses?.id || "unknown";
          if (!acc[cId]) acc[cId] = [];
          acc[cId].push(curr);
          return acc;
        },
        {}
      );

      for (const cId in attemptsByCourse) {
        const cAttempts = attemptsByCourse[cId];
        const courseName = cAttempts[0]?.courses?.name || cId;

        // 1. User Stats (One session per user)
        const userSessions: Record<string, any> = {};
        cAttempts.forEach((a: any) => {
          // Unique session per user-attempt. We only care about the "Final" state of a user.
          // Strategy: Max attempt per user.
          if (
            !userSessions[a.user_id] ||
            a.raw_attempt > userSessions[a.user_id].raw_attempt
          ) {
            userSessions[a.user_id] = {
              totalTime: a.total_time_seconds,
              attempt: a.raw_attempt,
              score: a.calculated_score,
            };
          }
        });
        const users = Object.values(userSessions);
        const totalUsersCount = users.length || 1; // Prevent division by zero

        const avgCourseTime = users.length
          ? users.reduce((sum: number, u: any) => sum + (u.totalTime || 0), 0) /
            users.length
          : 0;
        const avgScore = users.length
          ? users.reduce((sum: number, u: any) => sum + (u.score || 0), 0) /
            users.length
          : 0;

        // 2. Refined Attempts Logic (Matching AreaCard "Promedio Global")
        // Logic: Average of (Average Attempts per Skill - across ALL course users, not just participants in that skill)
        const attemptsBySkill: Record<string, any[]> = {};
        cAttempts.forEach((a: any) => {
          const skillName = a.skills?.full_name || "unknown";
          if (!attemptsBySkill[skillName]) attemptsBySkill[skillName] = [];
          attemptsBySkill[skillName].push(a);
        });

        const skillAverages: number[] = [];
        Object.values(attemptsBySkill).forEach((skillAttempts: any[]) => {
          // For a specific skill, what was the average attempts across ALL users?
          const userMaxAttemptsForSkill: Record<string, number> = {};
          skillAttempts.forEach((a) => {
            if (
              !userMaxAttemptsForSkill[a.user_id] ||
              a.raw_attempt > userMaxAttemptsForSkill[a.user_id]
            ) {
              userMaxAttemptsForSkill[a.user_id] = a.raw_attempt;
            }
          });
          const skillValues = Object.values(userMaxAttemptsForSkill);
          // CRITICAL FIX: Divide by TOTAL users in the course, treating missing users as 0?
          // Actually AreaCard implicitly treats them as contributing 0 to the sum but increasing the count.
          // So Sum(Attempts) / TotalUsers
          const skillAvg =
            skillValues.reduce((s, v) => s + v, 0) / totalUsersCount;
          skillAverages.push(skillAvg);
        });

        // "Promedio Intentos (Curso)" = Average of the Skill Averages
        const avgAttempts = skillAverages.length
          ? skillAverages.reduce((s, v) => s + v, 0) / skillAverages.length
          : 0;

        // 3. Question Stats (Raw Global)
        const avgQuestTime = cAttempts.length
          ? cAttempts.reduce(
              (sum: number, a: any) => sum + (a.unit_time_seconds || 0),
              0
            ) / cAttempts.length
          : 0;

        worksheet.addRow({
          courseName,
          avgCourseTime: formatSeconds(Math.round(avgCourseTime)),
          avgAttempts: parseFloat(avgAttempts.toFixed(1)), // Use toFixed(1) to match "~1.1" style
          avgQuestTime: formatSeconds(Math.round(avgQuestTime)),
          globalScore: (avgScore / 10).toFixed(1) + "/10",
        });
      }

      // Style Header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
    } else {
      // === DETAILED REPORT (SINGLE COURSE) ===
      // Group by Course
      const attemptsByCourse = (attempts || []).reduce(
        (acc: any, curr: any) => {
          const courseId = curr.courses?.id || "unknown";
          if (!acc[courseId]) acc[courseId] = [];
          acc[courseId].push(curr);
          return acc;
        },
        {}
      );

      const usedSheetNames = new Set<string>();

      // 3. Process each course
      for (const courseId in attemptsByCourse) {
        const courseAttempts = attemptsByCourse[courseId];
        const courseName = courseAttempts[0]?.courses?.name || courseId;

        // Generate a short, unique sheet name based on user request
        let sheetName = "";

        // Specific mapping based on course name keywords
        const lowerName = courseName.toLowerCase();
        if (lowerName.includes("comunicación en contingencia")) {
          sheetName = "ECC";
        } else if (lowerName.includes("administración de la contingencia")) {
          sheetName = "EAC";
        } else if (lowerName.includes("ti y si")) {
          sheetName = "TI y SI";
        } else if (
          lowerName.includes("respuesta a emergencias") &&
          !lowerName.includes("ti y si")
        ) {
          // ERE (excluding TI y SI)
          sheetName = "ERE";
        } else if (lowerName.includes("continuidad del negocio")) {
          sheetName = "ECN";
        } else {
          // Fallback: Try to extract acronym in parentheses or use ID
          const acronymMatch = courseName.match(/\(([^)]+)\)/);
          if (acronymMatch) {
            sheetName = acronymMatch[1];
          } else {
            sheetName = courseId
              .replace("team-", "")
              .toUpperCase()
              .substring(0, 30);
          }
        }

        // Sanitize (remove invalid Excel chars)
        sheetName = sheetName.replace(/[\\/?*[\]]/g, "");

        // Ensure unique sheet name (handle collisions)
        let counter = 1;
        const originalName = sheetName;
        while (usedSheetNames.has(sheetName)) {
          counter++;
          sheetName = `${originalName}_${counter}`;
        }

        usedSheetNames.add(sheetName);
        console.log(`Creating sheet: ${sheetName} for course: ${courseId}`);
        const worksheet = workbook.addWorksheet(sheetName);

        // Identify all unique skills for this course to make columns
        // Identify all unique skills for this course to make columns
        let uniqueSkills = Array.from(
          new Set(
            courseAttempts.map((a: any) => a.skills?.full_name).filter(Boolean)
          )
        ) as string[];

        // Custom Sort for EAC
        if (courseId === "team-eac" || sheetName === "EAC") {
          const eacOrderKeywords = [
            "Dirección de personas", // eac_1
            "Inteligencia emocional", // eac_3
            "Orientación al logro", // eac_5
            "Resolución de problemas", // eac_4
            "Conocimiento de la norma", // eac_6
          ];

          uniqueSkills.sort((a, b) => {
            const indexA = eacOrderKeywords.findIndex((k) => a.includes(k));
            const indexB = eacOrderKeywords.findIndex((k) => b.includes(k));
            // If not found, put at end
            return (
              (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
            );
          });
        } else {
          uniqueSkills.sort();
        }

        // Group by Session (User + Attempt)
        const sessions = courseAttempts.reduce((acc: any, curr: any) => {
          // Fallback session ID if missing (for old data)
          const sessionId =
            curr.session_id || `${curr.user_id}_${curr.raw_attempt}`;

          if (!acc[sessionId]) {
            acc[sessionId] = {
              userName: curr.users?.name || "Unknown",
              userEmail: curr.users?.email || "Unknown",
              attempt: curr.raw_attempt,
              totalTime: curr.total_time_seconds,
              timestamp: curr.timestamp,
              skills: {},
              scores: [],
            };
          }

          // Update total time if this record has a higher one (max aggregation)
          if (curr.total_time_seconds > acc[sessionId].totalTime) {
            acc[sessionId].totalTime = curr.total_time_seconds;
          }

          // Add score
          if (curr.calculated_score !== null) {
            acc[sessionId].scores.push(curr.calculated_score);
          }

          // Add skill time
          const skillName = curr.skills?.full_name;
          if (skillName) {
            acc[sessionId].skills[skillName] = curr.unit_time_seconds;
          }
          return acc;
        }, {});

        // Filter to keep only the latest attempt per user
        const latestSessionsByUser: Record<string, any> = {};

        Object.values(sessions).forEach((session: any) => {
          const userEmail = session.userEmail;
          // If we haven't seen this user, or this session is a later attempt
          // We use attempt number as primary sort, timestamp as secondary
          if (
            !latestSessionsByUser[userEmail] ||
            session.attempt > latestSessionsByUser[userEmail].attempt ||
            (session.attempt === latestSessionsByUser[userEmail].attempt &&
              new Date(session.timestamp) >
                new Date(latestSessionsByUser[userEmail].timestamp))
          ) {
            latestSessionsByUser[userEmail] = session;
          }
        });

        // Define Columns
        const columns = [
          { header: "Nombre", key: "userName", width: 30 },
          { header: "Email", key: "userEmail", width: 30 },
          { header: "Intento", key: "attempt", width: 10 },
          { header: "Tiempo Global", key: "totalTime", width: 15 },
          { header: "Puntuación Promedio", key: "avgScore", width: 15 },
          { header: "Fecha", key: "date", width: 20 },
          ...uniqueSkills.map((skill) => ({
            header: skill,
            key: skill,
            width: 25,
          })),
        ];
        worksheet.columns = columns;

        // Add Rows
        Object.values(latestSessionsByUser).forEach((session: any) => {
          const avgScoreRaw =
            session.scores.length > 0
              ? session.scores.reduce((a: number, b: number) => a + b, 0) /
                session.scores.length
              : 0;

          // Convert 0-100 scale to 0-10 scale
          const scoreOutOf10 = Math.round(avgScoreRaw / 10);
          const formattedScore = `${scoreOutOf10}/10`;

          const row: any = {
            userName: session.userName,
            userEmail: session.userEmail,
            attempt: session.attempt,
            totalTime: formatSeconds(session.totalTime),
            avgScore: formattedScore,
            date: new Date(session.timestamp).toLocaleString(),
          };

          // Format skill times
          uniqueSkills.forEach((skill) => {
            const time = session.skills[skill];
            row[skill] = time !== undefined ? formatSeconds(time) : "00:00:00";
          });

          worksheet.addRow(row);
        });

        // Style Header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
      }
    }

    // 4. Send Response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${
        courseId ? "reporte_curso_detallado" : "reporte_global_resumen"
      }.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Error generating report" });
  }
};
