import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const exportReport = async (req: Request, res: Response) => {
  try {
    // 1. Fetch Data
    let query = supabase
      .from('attempts')
      .select(`
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
      `)
      .order('timestamp', { ascending: false });

    // Filter by courseId if provided
    const { courseId } = req.query;
    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: attempts, error } = await query;

    if (error) throw error;

    const workbook = new ExcelJS.Workbook();

    // 2. Group by Course
    const attemptsByCourse = (attempts || []).reduce((acc: any, curr: any) => {
      const courseId = curr.courses?.id || 'unknown';
      if (!acc[courseId]) acc[courseId] = [];
      acc[courseId].push(curr);
      return acc;
    }, {});

    // Helper to format seconds to HH:mm:ss
    const formatSeconds = (seconds: number) => {
      if (!seconds && seconds !== 0) return '00:00:00';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const usedSheetNames = new Set<string>();

    // 3. Process each course
    for (const courseId in attemptsByCourse) {
      const courseAttempts = attemptsByCourse[courseId];
      const courseName = courseAttempts[0]?.courses?.name || courseId;
      
      // Generate a short, unique sheet name based on user request
      let sheetName = '';
      
      // Specific mapping based on course name keywords
      const lowerName = courseName.toLowerCase();
      if (lowerName.includes('comunicación en contingencia')) {
        sheetName = 'ECC';
      } else if (lowerName.includes('administración de la contingencia')) {
        sheetName = 'EAC';
      } else if (lowerName.includes('ti y si')) {
        sheetName = 'TI y SI';
      } else if (lowerName.includes('respuesta a emergencias') && !lowerName.includes('ti y si')) { // ERE (excluding TI y SI)
        sheetName = 'ERE';
      } else if (lowerName.includes('continuidad del negocio')) {
        sheetName = 'ECN';
      } else {
        // Fallback: Try to extract acronym in parentheses or use ID
        const acronymMatch = courseName.match(/\(([^)]+)\)/);
        if (acronymMatch) {
          sheetName = acronymMatch[1];
        } else {
          sheetName = courseId.replace('team-', '').toUpperCase().substring(0, 30);
        }
      }

      // Sanitize (remove invalid Excel chars)
      sheetName = sheetName.replace(/[\\/?*[\]]/g, '');
      
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
      const uniqueSkills = Array.from(new Set(courseAttempts.map((a: any) => a.skills?.full_name).filter(Boolean))).sort() as string[];

      // Group by Session (User + Attempt)
      const sessions = courseAttempts.reduce((acc: any, curr: any) => {
        // Fallback session ID if missing (for old data)
        const sessionId = curr.session_id || `${curr.user_id}_${curr.raw_attempt}`;
        
        if (!acc[sessionId]) {
          acc[sessionId] = {
            userName: curr.users?.name || 'Unknown',
            userEmail: curr.users?.email || 'Unknown',
            attempt: curr.raw_attempt,
            totalTime: curr.total_time_seconds,
            timestamp: curr.timestamp,
            skills: {},
            scores: []
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
        if (!latestSessionsByUser[userEmail] || 
            session.attempt > latestSessionsByUser[userEmail].attempt ||
            (session.attempt === latestSessionsByUser[userEmail].attempt && new Date(session.timestamp) > new Date(latestSessionsByUser[userEmail].timestamp))) {
          latestSessionsByUser[userEmail] = session;
        }
      });

      // Define Columns
      const columns = [
        { header: 'Nombre', key: 'userName', width: 30 },
        { header: 'Email', key: 'userEmail', width: 30 },
        { header: 'Intento', key: 'attempt', width: 10 },
        { header: 'Tiempo Global', key: 'totalTime', width: 15 },
        { header: 'Puntuación Promedio', key: 'avgScore', width: 15 },
        { header: 'Fecha', key: 'date', width: 20 },
        ...uniqueSkills.map(skill => ({ header: skill, key: skill, width: 25 }))
      ];
      worksheet.columns = columns;

      // Add Rows
      Object.values(latestSessionsByUser).forEach((session: any) => {
        const avgScoreRaw = session.scores.length > 0 
          ? (session.scores.reduce((a: number, b: number) => a + b, 0) / session.scores.length)
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
        uniqueSkills.forEach(skill => {
          const time = session.skills[skill];
          row[skill] = time !== undefined ? formatSeconds(time) : '00:00:00';
        });

        worksheet.addRow(row);
      });

      // Style Header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }

    // 4. Send Response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_tiempos_detallado.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Error generating report' });
  }
};
