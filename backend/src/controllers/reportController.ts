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

        // 1. Prepare Data: Unique Skills and Users
        const uniqueSkillNames = Array.from(
          new Set(
            cAttempts.map((a: any) => a.skills?.full_name).filter(Boolean)
          )
        ) as string[];
        const userSessions: Record<string, any> = {};
        const maxScoreByUserSkill: Record<string, number> = {}; // Key: userId_skillName

        cAttempts.forEach((a: any) => {
          // Session tracking for Time
          if (
            !userSessions[a.user_id] ||
            a.raw_attempt > userSessions[a.user_id].raw_attempt
          ) {
            userSessions[a.user_id] = {
              totalTime: a.total_time_seconds,
              attempt: a.raw_attempt,
            };
          }

          // Score tracking (Max per skill)
          const key = `${a.user_id}_${a.skills?.full_name}`;
          const score = a.calculated_score || 0;
          if (
            maxScoreByUserSkill[key] === undefined ||
            score > maxScoreByUserSkill[key]
          ) {
            maxScoreByUserSkill[key] = score;
          }
        });

        const users = Object.values(userSessions);
        const allUserIds = Object.keys(userSessions);
        const totalUsersCount = allUserIds.length || 1;

        const avgCourseTime = users.length
          ? users.reduce((sum: number, u: any) => sum + (u.totalTime || 0), 0) /
            users.length
          : 0;

        // 2. Calculate Global Score (Average of User Scores)
        // User Score = Average of their Skill Scores (0 if missing)
        let sumUserCourseScores = 0;
        allUserIds.forEach((userId) => {
          let userTotalScore = 0;
          uniqueSkillNames.forEach((skillName) => {
            const key = `${userId}_${skillName}`;
            userTotalScore += maxScoreByUserSkill[key] || 0;
          });
          // Average score for this user across all skills (0-100 scale)
          const userAvg = uniqueSkillNames.length
            ? userTotalScore / uniqueSkillNames.length
            : 0;
          sumUserCourseScores += userAvg;
        });

        const avgScore = sumUserCourseScores / totalUsersCount;

        // Format Score: Integer check
        const scoreVal = avgScore / 10;
        const globalScoreStr = Number.isInteger(scoreVal)
          ? scoreVal.toFixed(0)
          : scoreVal.toFixed(1);

        // 3. Refined Attempts Logic (Matching AreaCard "Promedio Global")
        // Logic: Average of (Average Attempts per Skill - across ALL course users, handling 0s for missing skills)

        // 3b. Build a lookup for max attempt per user-skill
        const maxAttemptsByUserSkill: Record<string, number> = {};
        cAttempts.forEach((a: any) => {
          const key = `${a.user_id}_${a.skills?.full_name}`;
          if (
            !maxAttemptsByUserSkill[key] ||
            a.raw_attempt > maxAttemptsByUserSkill[key]
          ) {
            maxAttemptsByUserSkill[key] = a.raw_attempt;
          }
        });

        // 3c. Calculate average for each skill (including 0s for user who haven't tried it)
        const skillAverages: number[] = [];

        uniqueSkillNames.forEach((skillName) => {
          let sumAttempts = 0;
          allUserIds.forEach((userId) => {
            const key = `${userId}_${skillName}`;
            const userMax = maxAttemptsByUserSkill[key] || 0;
            sumAttempts += userMax;
          });

          const rawAvg = sumAttempts / totalUsersCount;
          // Round intermediate skill average to 1 decimal (Dashboard logic)
          skillAverages.push(parseFloat(rawAvg.toFixed(1)));
        });

        // "Promedio Intentos (Curso)" = Average of the ROUNDED Skill Averages
        const avgAttempts = skillAverages.length
          ? skillAverages.reduce((s, v) => s + v, 0) / skillAverages.length
          : 0;

        // 4. Question Stats (Raw Global)
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
          globalScore: `${globalScoreStr}/10`,
        });
      }

      // ==========================================
      // NEW SECTION: Global Skill Averages by Course
      // ==========================================
      worksheet.addRow([]);
      worksheet.addRow([]);
      const skillHeaderRow = worksheet.addRow([
        "Reporte Global por Curso y Habilidad",
        "Nota Promedio",
      ]);
      skillHeaderRow.font = { bold: true, size: 14 };

      // Iterate through each course to list its skills and averages
      Object.keys(attemptsByCourse).forEach((cId) => {
        const cAttempts = attemptsByCourse[cId];
        const courseName = cAttempts[0]?.courses?.name || cId;

        // Add Course Header
        worksheet.addRow([]);
        const courseRow = worksheet.addRow([courseName]);
        courseRow.font = { bold: true, color: { argb: "FF000000" } }; // Bold black
        courseRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF0F0F0" },
        }; // Light gray background

        // 1. Identify users and skills for this course
        const uniqueSkillNames = Array.from(
          new Set(
            cAttempts.map((a: any) => a.skills?.full_name).filter(Boolean)
          )
        ) as string[];
        const userSessions: Record<string, any> = {};
        cAttempts.forEach((a: any) => {
          if (
            !userSessions[a.user_id] ||
            a.raw_attempt > userSessions[a.user_id].raw_attempt
          ) {
            userSessions[a.user_id] = { final: true }; // Just distinct users
          }
        });
        const allUserIds = Object.keys(userSessions);
        const totalUsersCount = allUserIds.length || 1;

        // 2. Build Max Score Lookup per (User + Skill)
        const maxScoreByUserSkill: Record<string, number> = {};
        cAttempts.forEach((a: any) => {
          const key = `${a.user_id}_${a.skills?.full_name}`;
          const score = a.calculated_score || 0;
          if (
            maxScoreByUserSkill[key] === undefined ||
            score > maxScoreByUserSkill[key]
          ) {
            maxScoreByUserSkill[key] = score;
          }
        });

        // 3. Calculate and List Averages per Skill
        uniqueSkillNames.sort().forEach((skillName) => {
          let sumScores = 0;
          allUserIds.forEach((userId) => {
            const key = `${userId}_${skillName}`;
            sumScores += maxScoreByUserSkill[key] || 0; // Default 0 if not attempted
          });

          const avgScoreRaw = sumScores / totalUsersCount;
          const scoreVal = avgScoreRaw / 10;
          const scoreFormatted =
            (Number.isInteger(scoreVal)
              ? scoreVal.toFixed(0)
              : scoreVal.toFixed(1)) + "/10";

          worksheet.addRow({
            courseName: `   ${skillName}`, // Indent slightly for visual hierarchy
            avgCourseTime: scoreFormatted,
          });
        });
      });

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

        // Pre-process: Count total attempts per user-skill for the Scoring Matrix
        // Matrix: 1st=10, 2nd=8, 3rd=6, 4th=4, 5th=2, 6th+=0
        const attemptsCountByUserSkill: Record<string, number> = {};
        courseAttempts.forEach((a: any) => {
          const skillName = a.skills?.full_name;
          if (skillName && a.user_id) {
            const key = `${a.user_id}_${skillName}`;
            attemptsCountByUserSkill[key] =
              (attemptsCountByUserSkill[key] || 0) + 1;
          }
        });

        const calculateMatrixScore = (attemptNum: number): string => {
          if (attemptNum < 1) return "0/10";
          const score = Math.max(0, 10 - (attemptNum - 1) * 2);
          return `${score}/10`;
        };

        // Group by Session (User + Attempt)
        const sessions = courseAttempts.reduce((acc: any, curr: any) => {
          // Fallback session ID if missing (for old data)
          const sessionId =
            curr.session_id || `${curr.user_id}_${curr.raw_attempt}`;

          if (!acc[sessionId]) {
            acc[sessionId] = {
              userId: curr.user_id, // Store userId for lookup
              userName: curr.users?.name || "Unknown",
              userEmail: curr.users?.email || "Unknown",
              attempt: curr.raw_attempt,
              totalTime: curr.total_time_seconds,
              timestamp: curr.timestamp,
              skills: {}, // Stores time
              skillScores: {}, // Stores score from DB (legacy/global usage if needed)
            };
          }

          // Update total time if this record has a higher one (max aggregation)
          if (curr.total_time_seconds > acc[sessionId].totalTime) {
            acc[sessionId].totalTime = curr.total_time_seconds;
          }

          const skillName = curr.skills?.full_name;
          if (skillName) {
            // Add skill time for this session
            acc[sessionId].skills[skillName] = curr.unit_time_seconds;

            // For global score calc, we keep tracking the calculated_score property if present
            if (
              curr.calculated_score !== null &&
              acc[sessionId].skillScores[skillName] === undefined
            ) {
              acc[sessionId].skillScores[skillName] = curr.calculated_score;
            }
          }
          return acc;
        }, {});

        // Filter to keep only the latest attempt per user
        const latestSessionsByUser: Record<string, any> = {};

        Object.values(sessions).forEach((session: any) => {
          const userEmail = session.userEmail;
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
          { header: "Número de Intento", key: "attempt", width: 10 },
          { header: "Tiempo Global", key: "totalTime", width: 15 },
          { header: "Puntuación Promedio", key: "avgScore", width: 15 },
          { header: "Fecha", key: "date", width: 20 },
        ];

        // Add dynamic columns for each skill (Time + Score)
        uniqueSkills.forEach((skill) => {
          columns.push({
            header: `${skill} (Tiempo)`,
            key: `${skill}_time`,
            width: 15,
          });
          columns.push({
            header: `${skill} (Nota)`,
            key: `${skill}_score`,
            width: 10,
          });
        });

        worksheet.columns = columns;

        // Add Rows
        Object.values(latestSessionsByUser).forEach((session: any) => {
          // Calculate score based on Sum of Skill Scores / Total Course Skills
          const scores = Object.values(session.skillScores) as number[];
          const totalScore = scores.reduce((a, b) => a + b, 0);
          const avgScoreRaw =
            uniqueSkills.length > 0 ? totalScore / uniqueSkills.length : 0;

          // Convert 0-100 scale to 0-10 scale
          const scoreVal = avgScoreRaw / 10;
          const scoreOutOf10 = Number.isInteger(scoreVal)
            ? scoreVal.toFixed(0)
            : scoreVal.toFixed(1);
          const formattedScore = `${scoreOutOf10}/10`;

          const row: any = {
            userName: session.userName,
            userEmail: session.userEmail,
            attempt: session.attempt,
            totalTime: formatSeconds(session.totalTime),
            avgScore: formattedScore,
            date: new Date(session.timestamp).toLocaleString(),
          };

          // Format skill times and scores
          uniqueSkills.forEach((skill) => {
            const time = session.skills[skill];
            // Time
            row[`${skill}_time`] =
              time !== undefined ? formatSeconds(time) : "00:00:00";

            // Score (Matrix Logic)
            // If the user participated in this skill in THIS session, we calculate the score based on cumulative attempts
            // If they did NOT participate in this session (time undef), score is 0/10? Or N/A?
            // Assuming 0/10 if not present in latest, or we check history?
            // Usually if missing from latest, it means 0.
            if (time !== undefined) {
              const key = `${session.userId}_${skill}`;
              const attemptCount = attemptsCountByUserSkill[key] || 1;
              row[`${skill}_score`] = calculateMatrixScore(attemptCount);
            } else {
              row[`${skill}_score`] = "0/10";
            }
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
