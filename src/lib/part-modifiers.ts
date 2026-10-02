/**
 * المُعدِّلات التي تُختار بعد نوع القطعة (برومت أكتوبر ٢٠٢٦، المرحلة 5): «أمامي/خلفي» جزء
 * من النوع نفسه في القاموس (front_pads/rear_pads)، أما «يمين/يسار» و«فوق/تحت» فهنا —
 * فقط للأنواع التي تأتي بطرفين. القائمة للمراجعة مع المركز.
 */

export type PartModifier = "side" | "position";

export const SIDE_OPTIONS = ["يمين", "يسار", "الاثنين"] as const;
export const POSITION_OPTIONS = ["فوق", "تحت"] as const;
export type SideOption = (typeof SIDE_OPTIONS)[number];
export type PositionOption = (typeof POSITION_OPTIONS)[number];

const SIDE = new Set([
  "headlamp",
  "headlamp_bracket",
  "tail_lamp",
  "fog_lamp",
  "fog_cover",
  "mirror",
  "mirror_glass",
  "fender",
  "fender_liner",
  "fender_trim",
  "door",
  "door_handle",
  "window_regulator",
  "bumper_bracket",
  "front_shocks",
  "rear_shocks",
  "front_arm",
  "rear_arm",
  "ball_joint",
  "arm_bushing",
  "stab_link",
  "strut_mount",
  "tie_rod_end",
  "inner_tie_rod",
  "wheel_bearing",
  "hub",
]);

/** المقص وجوزته وخرطوش الرديتر تأتي علوية وسفلية */
const POSITION = new Set(["front_arm", "ball_joint", "radiator_hose"]);

export function partModifiers(key: string): PartModifier[] {
  const list: PartModifier[] = [];
  if (SIDE.has(key)) list.push("side");
  if (POSITION.has(key)) list.push("position");
  return list;
}
