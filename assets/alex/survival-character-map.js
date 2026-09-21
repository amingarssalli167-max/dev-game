/* CHERNOBYL: ECHOES OF ZERO — Survival Character mapping
 * Presentation-only data. Does not alter movement, collision, camera, or gameplay.
 * Source asset: Survival_Character.fbx
 */
window.SURVIVAL_ALEX = {
  source: "Survival_Character.fbx",
  modelPath: "Survival_Character.fbx",
  facing: { sourceFront: "+Z", alexFront: "-Z", yawOffset: Math.PI },
  scale: { sourceUnit: "cm", targetHeightMeters: 1.82 },
  restPose: "A",
  skeleton: {
    Hips: "pelvis",
    Spine: "spine_01",
    Spine1: "spine_02",
    Spine2: "spine_03",
    Spine3: "spine_04",
    Spine4: "spine_05",
    Neck: "neck_01",
    Head: "head",
    LeftShoulder: "clavicle_l",
    RightShoulder: "clavicle_r",
    LeftArm: "upperarm_l",
    RightArm: "upperarm_r",
    LeftForeArm: "lowerarm_l",
    RightForeArm: "lowerarm_r",
    LeftHand: "hand_l",
    RightHand: "hand_r",
    LeftUpLeg: "thigh_l",
    RightUpLeg: "thigh_r",
    LeftLeg: "calf_l",
    RightLeg: "calf_r",
    LeftFoot: "foot_l",
    RightFoot: "foot_r",
    LeftToeBase: "ball_l",
    RightToeBase: "ball_r"
  },
  notes: [
    "The FBX is an A-pose; do not pretend it is already T-pose.",
    "Rest-pose baking should happen during asset preparation, not inside the gameplay loop.",
    "Keep the full skeleton; animation code only addresses the mapped bones.",
    "Textures are external and are not embedded in the FBX."
  ]
};
