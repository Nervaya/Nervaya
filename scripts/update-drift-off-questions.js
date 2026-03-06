import mongoose from 'mongoose';
import { v4 } from 'uuid';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI environment variable is required. Run with: MONGODB_URI=... node scripts/update-drift-off-questions.js',
  );
}

const questionOptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const sleepAssessmentQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true, default: () => v4() },
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ['single_choice', 'multiple_choice', 'text'], required: true },
    options: [questionOptionSchema],
    order: { type: Number, required: true },
    isRequired: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const SleepAssessmentQuestion =
  mongoose.models.SleepAssessmentQuestion || mongoose.model('SleepAssessmentQuestion', sleepAssessmentQuestionSchema);

const driftOffQuestions = [
  {
    questionId: 'drift_off_1',
    questionText: 'What is the primary challenge you are currently experiencing with your sleep?',
    questionType: 'single_choice',
    order: 1,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Difficulty falling asleep', value: 'difficulty_falling_asleep' },
      { id: 'b', label: 'Waking up during night', value: 'waking_night' },
      { id: 'c', label: 'Light or restless sleep', value: 'light_restless' },
      { id: 'd', label: 'Just seeking deeper restorative nights', value: 'deeper_restorative' },
    ],
  },
  {
    questionId: 'drift_off_2',
    questionText: 'How long has this been affecting your sleep?',
    questionType: 'single_choice',
    order: 2,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'A few days', value: 'few_days' },
      { id: 'b', label: 'A few weeks', value: 'few_weeks' },
      { id: 'c', label: 'A few months', value: 'few_months' },
      { id: 'd', label: 'On and off for a long time', value: 'long_time' },
    ],
  },
  {
    questionId: 'drift_off_3',
    questionText: 'On average, how many hours of restful, quality sleep do you get each night?',
    questionType: 'single_choice',
    order: 3,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Less than 4 hours', value: 'less_4_hours' },
      { id: 'b', label: '4–6 hours', value: '4_6_hours' },
      { id: 'c', label: '6–7 hours', value: '6_7_hours' },
      { id: 'd', label: '7–9 hours', value: '7_9_hours' },
      { id: 'e', label: 'More than 9 hours', value: 'more_9_hours' },
    ],
  },
  {
    questionId: 'drift_off_4',
    questionText: 'What time do you usually attempt to fall asleep?',
    questionType: 'single_choice',
    order: 4,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Before 10:00 PM', value: 'before_10pm' },
      { id: 'b', label: 'Between 10:00–11:00 PM', value: '10_11pm' },
      { id: 'c', label: 'Between 11:00 PM–12:00 AM', value: '11pm_12am' },
      { id: 'd', label: 'After midnight', value: 'after_midnight' },
    ],
  },
  {
    questionId: 'drift_off_5',
    questionText: 'How do you typically feel upon waking in the morning?',
    questionType: 'single_choice',
    order: 5,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Very tired', value: 'very_tired' },
      { id: 'b', label: 'Slightly tired', value: 'slightly_tired' },
      { id: 'c', label: 'Mostly okay', value: 'mostly_okay' },
      { id: 'd', label: 'Fresh and well-rested', value: 'fresh_well_rested' },
    ],
  },
  {
    questionId: 'drift_off_6',
    questionText: 'What most often keeps your mind active at night?',
    questionType: 'single_choice',
    order: 6,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Overthinking', value: 'overthinking' },
      { id: 'b', label: 'Worries about future', value: 'worries_future' },
      { id: 'c', label: "Replaying day's events", value: 'replaying_day' },
      { id: 'd', label: 'Random or scattered thoughts', value: 'random_thoughts' },
    ],
  },
  {
    questionId: 'drift_off_7',
    questionText: 'Which emotional state best describes you these days?',
    questionType: 'single_choice',
    order: 7,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Anxious', value: 'anxious' },
      { id: 'b', label: 'Overwhelmed', value: 'overwhelmed' },
      { id: 'c', label: 'Emotionally exhausted', value: 'emotionally_exhausted' },
      { id: 'd', label: 'Mostly calm', value: 'mostly_calm' },
    ],
  },
  {
    questionId: 'drift_off_8',
    questionText: 'Do your thoughts feel heavier or more intense at night compared to daytime?',
    questionType: 'single_choice',
    order: 8,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Yes, significantly more', value: 'significantly_more' },
      { id: 'b', label: 'Sometimes', value: 'sometimes' },
      { id: 'c', label: 'Not really', value: 'not_really' },
      { id: 'd', label: "I'm not sure", value: 'not_sure' },
    ],
  },
  {
    questionId: 'drift_off_9',
    questionText: 'How intense does this experience feel for you right now?',
    questionType: 'single_choice',
    order: 9,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Mild', value: 'mild' },
      { id: 'b', label: 'Moderate', value: 'moderate' },
      { id: 'c', label: 'Strong', value: 'strong' },
      { id: 'd', label: 'Very strong', value: 'very_strong' },
    ],
  },
  {
    questionId: 'drift_off_10',
    questionText: 'What concerns you most as you prepare for sleep?',
    questionType: 'single_choice',
    order: 10,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Not being able to fall asleep', value: 'falling_asleep' },
      { id: 'b', label: 'Health or physical sensations', value: 'health_physical' },
      { id: 'c', label: 'Family or relationship matters', value: 'family_relationship' },
      { id: 'd', label: 'Work or future responsibilities', value: 'work_responsibilities' },
    ],
  },
  {
    questionId: 'drift_off_11',
    questionText: 'Do you generally feel emotionally safe when trying to rest?',
    questionType: 'single_choice',
    order: 11,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Yes', value: 'yes' },
      { id: 'b', label: 'Sometimes', value: 'sometimes' },
      { id: 'c', label: 'Rarely', value: 'rarely' },
      { id: 'd', label: 'Not sure', value: 'not_sure' },
    ],
  },
  {
    questionId: 'drift_off_12',
    questionText: 'How does your body usually feel when you lie down to rest?',
    questionType: 'single_choice',
    order: 12,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Tense', value: 'tense' },
      { id: 'b', label: 'Restless', value: 'restless' },
      { id: 'c', label: 'Heavy', value: 'heavy' },
      { id: 'd', label: 'Mostly relaxed', value: 'mostly_relaxed' },
    ],
  },
  {
    questionId: 'drift_off_13',
    questionText: 'Do you notice any physical discomfort while resting?',
    questionType: 'single_choice',
    order: 13,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Tightness in chest or stomach', value: 'chest_stomach_tightness' },
      { id: 'b', label: 'Shallow or uncomfortable breathing', value: 'shallow_breathing' },
      { id: 'c', label: 'Muscle tightness', value: 'muscle_tightness' },
      { id: 'd', label: 'No noticeable discomfort', value: 'no_discomfort' },
    ],
  },
  {
    questionId: 'drift_off_14',
    questionText: 'Does your body find it difficult to relax even when you feel tired?',
    questionType: 'single_choice',
    order: 14,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Yes', value: 'yes' },
      { id: 'b', label: 'Sometimes', value: 'sometimes' },
      { id: 'c', label: 'Rarely', value: 'rarely' },
      { id: 'd', label: 'No', value: 'no' },
    ],
  },
  {
    questionId: 'drift_off_15',
    questionText: 'Do you feel more mentally alert at night than during the daytime?',
    questionType: 'single_choice',
    order: 15,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Yes', value: 'yes' },
      { id: 'b', label: 'Sometimes', value: 'sometimes' },
      { id: 'c', label: 'Rarely', value: 'rarely' },
      { id: 'd', label: 'No', value: 'no' },
    ],
  },
  {
    questionId: 'drift_off_16',
    questionText: 'Where do you currently notice physical tension? (Select all that apply)',
    questionType: 'multiple_choice',
    order: 16,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Head / forehead', value: 'head_forehead' },
      { id: 'b', label: 'Jaw / neck', value: 'jaw_neck' },
      { id: 'c', label: 'Chest', value: 'chest' },
      { id: 'd', label: 'Stomach', value: 'stomach' },
      { id: 'e', label: 'Shoulders', value: 'shoulders' },
      { id: 'f', label: 'Lower back', value: 'lower_back' },
      { id: 'g', label: 'I do not notice significant tension', value: 'no_tension' },
    ],
  },
  {
    questionId: 'drift_off_17',
    questionText: 'What usually helps calm your mind when trying to sleep?',
    questionType: 'single_choice',
    order: 17,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Silence', value: 'silence' },
      { id: 'b', label: 'Music or ambient sounds', value: 'music_ambient' },
      { id: 'c', label: 'Slow or guided breathing', value: 'guided_breathing' },
      { id: 'd', label: "Listening to someone's voice", value: 'voice_guidance' },
    ],
  },
  {
    questionId: 'drift_off_18',
    questionText: 'What would you like to gain most from this session?',
    questionType: 'single_choice',
    order: 18,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Fall asleep faster', value: 'fall_asleep_faster' },
      { id: 'b', label: 'Stay asleep longer', value: 'stay_asleep_longer' },
      { id: 'c', label: 'Quiet mental activity', value: 'quiet_mental' },
      { id: 'd', label: 'Deep emotional and nervous system rest', value: 'deep_emotional_rest' },
    ],
  },
  {
    questionId: 'drift_off_19',
    questionText: 'When do you plan to listen to this session most often?',
    questionType: 'single_choice',
    order: 19,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Before going to sleep', value: 'before_sleep' },
      { id: 'b', label: 'During night-time awakenings', value: 'night_awakenings' },
      { id: 'c', label: 'For daytime relaxation', value: 'daytime_relaxation' },
      { id: 'd', label: 'No fixed time', value: 'no_fixed_time' },
    ],
  },
  {
    questionId: 'drift_off_20',
    questionText: 'What background do you prefer during the session?',
    questionType: 'single_choice',
    order: 20,
    isRequired: true,
    isActive: true,
    options: [
      { id: 'a', label: 'Soft music', value: 'soft_music' },
      { id: 'b', label: 'Nature sounds', value: 'nature_sounds' },
      { id: 'c', label: 'Silence', value: 'silence' },
      { id: 'd', label: 'No specific preference', value: 'no_preference' },
    ],
  },
  {
    questionId: 'drift_off_21',
    questionText: 'Note to therapist:',
    questionType: 'text',
    order: 21,
    isRequired: false,
    isActive: true,
    options: [],
  },
];

async function updateDriftOffQuestions() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing questions
    await SleepAssessmentQuestion.deleteMany({});
    console.log('Cleared existing questions');

    // Insert new questions
    await SleepAssessmentQuestion.insertMany(driftOffQuestions);
    console.log('Inserted new Drift Off questions');

    console.log('Drift Off questions updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating questions:', error);
    process.exit(1);
  }
}

updateDriftOffQuestions();
