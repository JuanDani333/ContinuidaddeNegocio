import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Helper to calculate score based on attempt number (matches frontend logic)
const calculatePxFromAttempt = (attempt: number): number => {
  if (attempt === 1) return 100;
  if (attempt === 2) return 80;
  if (attempt === 3) return 60;
  if (attempt === 4) return 40;
  if (attempt === 5) return 20;
  return 0;
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    // 1. Fetch all necessary data in parallel
    // We now fetch 'course_skills' to understand the Many-to-Many relationship
    const [coursesRes, skillsRes, courseSkillsRes, attemptsRes, usersRes] = await Promise.all([
      supabase.from('courses').select('*').order('display_order'),
      supabase.from('skills').select('*'), // No order here, order is in course_skills
      supabase.from('course_skills').select('*').order('display_order'),
      supabase.from('attempts').select('*'),
      supabase.from('users').select('*')
    ]);

    if (coursesRes.error) throw coursesRes.error;
    if (skillsRes.error) throw skillsRes.error;
    if (courseSkillsRes.error) throw courseSkillsRes.error;
    if (attemptsRes.error) throw attemptsRes.error;
    if (usersRes.error) throw usersRes.error;

    const courses = coursesRes.data;
    const skills = skillsRes.data;
    const courseSkills = courseSkillsRes.data;
    const attempts = attemptsRes.data;
    const users = usersRes.data;

    // 2. Structure data to match frontend AreaData interface
    const dashboardData = courses.map(course => {
      // Get skills for this course via the junction table
      const courseSkillRelations = courseSkills.filter(cs => cs.course_id === course.id);
      
      // Map relations to actual skill objects
      const scenes = courseSkillRelations.map(cs => {
        const skill = skills.find(s => s.id === cs.skill_id);
        return {
          id: skill?.id || cs.skill_id,
          short: skill?.name || 'Unknown',
          full: skill?.full_name || skill?.name || 'Unknown'
        };
      });

      // Get all users who have attempted this course
      const assessments = users.map(user => {
        // Find attempts for this user in this course
        const userAttempts = attempts.filter(a => a.user_id === user.id && a.course_id === course.id);
        
        // Map attempts to "SceneScore" format
        const scores = scenes.map(scene => {
          // Find specific attempt for this skill (Get the LATEST one)
          const attemptRecord = userAttempts
            .filter(a => a.skill_id === scene.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
          
          const attemptNum = attemptRecord ? attemptRecord.raw_attempt : 0;
          const value = attemptRecord ? (attemptRecord.calculated_score || calculatePxFromAttempt(attemptNum)) : 0;
          const time = attemptRecord ? attemptRecord.unit_time_seconds : 0;

          return {
            sceneId: scene.id,
            scene: scene.short,
            attempt: attemptNum,
            value: Number(value),
            time: Number(time)
          };
        });

        return {
          id: user.id,
          name: user.name,
          scores: scores,
          hasAttempts: userAttempts.length > 0 // Flag to filter later
        };
      }).filter(user => user.hasAttempts); // Only keep users who have attempted this course
      
      return {
        id: course.id,
        title: course.name,
        description: course.description || '',
        scenes: scenes,
        assessments: assessments
      };
    });

    res.json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};
