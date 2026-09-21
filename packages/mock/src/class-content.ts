import type { PublicClass } from "@balanse/domain";

type ClassContent = Pick<
  PublicClass,
  "slug" | "description" | "coachIds" | "heroImage" | "galleryImages"
>;

function content(
  slug: string,
  coachIds: string[],
  description: string,
  accent: string,
): ClassContent {
  const heroImage = `/assets/marketing/classes/${slug}-hero.webp`;
  return {
    slug,
    coachIds,
    description,
    heroImage,
    galleryImages: [heroImage, `/assets/marketing/coaches/specialty-accent-${accent}-1x1.webp`],
  };
}

/** Editorial mock copy and conceptual images, not claims about a live timetable. */
export const classContent: Record<string, ClassContent> = {
  "class-yoga": content(
    "yoga",
    ["coach-wolf", "coach-kate"],
    "**Room to breathe. Space to move.**\n\nA guided practice that connects breath with movement, with time to explore balance, mobility, and stillness. Find a pace that works for you rather than chasing a perfect pose.\n\n**What to expect**\n\n- A gradual warm-up and guided movement sequence\n- Standing and floor-based postures, with options along the way\n- A slower finish and a moment to settle\n\nWear clothes you can move in and bring water. Let your coach know if you are new so they can help you find an appropriate starting point.",
    "yoga",
  ),
  "class-pilates": content(
    "mat-pilates",
    ["coach-rex", "coach-jodi", "coach-sofia"],
    "**Small movements. Considered effort.**\n\nMat Pilates brings attention to alignment, breath, and controlled movement. Work through a focused sequence on the mat, exploring how your whole body supports each repetition.\n\n**Inside the class**\n\n- A gentle introduction to breathing and body awareness\n- Controlled mat exercises with clear coaching cues\n- Time to reset between sequences\n\nBring water and comfortable training clothes. Your coach can offer different versions of a movement as you build familiarity.",
    "pilates",
  ),
  "class-calisthenics": content(
    "calisthenics",
    ["coach-rex", "coach-ephraim", "coach-alec"],
    "**Build strength you can move with.**\n\nUse your own bodyweight to explore strength, control, and skill. From foundational pushing and pulling to supported balance work, the practice grows with your experience.\n\n**What you will work on**\n\n- Joint preparation and a progressive warm-up\n- Bodyweight strength patterns and coached skill progressions\n- Controlled repetitions with time to recover\n\nYou do not need an advanced skill to begin. Choose a session, tell your coach where you are starting, and build from there.",
    "calisthenics",
  ),
  "class-caliyoga": content(
    "caliyoga",
    ["coach-rex"],
    "**Strength meets a slower rhythm.**\n\nCaliyoga brings bodyweight strength and yoga-inspired movement into one practice. Explore grounded transitions, balance, and breath without separating strength from mobility.\n\n**Expect a blend of**\n\n- Guided preparation and breath-led movement\n- Bodyweight holds and accessible progressions\n- Floor sequences and a slower finish\n\nCome in clothes that allow you to stretch and support your own weight. Bring water and curiosity.",
    "yoga",
  ),
  "class-circuit": content(
    "circuit-training",
    ["coach-ephraim", "coach-alec"],
    "**A little variety. A shared rhythm.**\n\nMove through a sequence of strength and conditioning stations with a coach to guide your technique and pace. The format keeps the session varied while making room for different starting points.\n\n**The session includes**\n\n- A full-body warm-up\n- Timed or repetition-based training stations\n- Recovery breaks and a guided finish\n\nBring water and training shoes. Ask your coach about adapting a station when you need a different level of challenge.",
    "calisthenics",
  ),
  "class-kickboxing": content(
    "kickboxing",
    ["coach-rachelle"],
    "**Find your stance. Build your rhythm.**\n\nExplore striking fundamentals through footwork, combinations, and coached pad drills. Technique comes first as you build confidence moving through each sequence.\n\n**What to expect**\n\n- Warm-up and stance practice\n- Punching and kicking combinations\n- Pad work and conditioning at a manageable pace\n\nCheck equipment requirements with the studio before your first visit. Bring water and comfortable training clothes.",
    "boxing",
  ),
  "class-bjj": content(
    "brazilian-jiu-jitsu",
    ["coach-rachelle"],
    "**Learn the details, one position at a time.**\n\nBrazilian Jiu-Jitsu explores ground movement, positioning, and technical problem-solving with a partner. Coaching focuses on controlled practice, clear communication, and respect for your training partner.\n\n**The fundamentals**\n\n- Movement preparation on the mat\n- Position-based demonstrations and partner drills\n- Time to ask questions and revisit technique\n\nContact the studio about gi and equipment requirements before your first session. Tell your coach if this is your first time on the mat.",
    "calisthenics",
  ),
  "class-groundworks": content(
    "groundworks",
    ["coach-ephraim"],
    "**Get closer to the floor. Find another way to move.**\n\nGroundworks explores floor-based strength, mobility, and transitions. Use a low centre of gravity to discover how different movement patterns connect.\n\n**During the practice**\n\n- Prepare your wrists, hips, and shoulders\n- Explore controlled floor patterns and transitions\n- Connect movements into short sequences\n\nWear comfortable clothing and bring water. Work at your own pace, with guidance when a movement feels unfamiliar.",
    "calisthenics",
  ),
  "class-dance": content(
    "dance-fitness",
    ["coach-mikaela", "coach-maris", "coach-francis"],
    "**Make space for a different kind of energy.**\n\nDance fitness brings music, movement, and a shared sense of play into the studio. Different sessions explore Groove, Femme, Contemporary, and other styles; check the session name for the focus.\n\n**Find your own expression**\n\n- A warm-up that introduces the session’s rhythm\n- Guided combinations built up in manageable sections\n- Time to connect the sequence and enjoy moving\n\nBring water and clothes you feel comfortable moving in. You do not need to arrive knowing the choreography.",
    "dance",
  ),
};
