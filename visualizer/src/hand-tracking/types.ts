export interface Vec3 {
	x: number;
	y: number;
	z: number;
}

export interface Quat {
	x: number;
	y: number;
	z: number;
	w: number;
}

export interface JointData {
	position: Vec3;
	orientation: Quat;
	radius: number;
}

export interface PinchState {
	isPinching: boolean;
	distance: number;
}

export interface HandPose {
	handedness: "left" | "right";
	timestamp: number;
	joints: Map<XRHandJoint, JointData>;
	pinchState: PinchState;
	wristPosition: Vec3;
	wristOrientation: Quat;
}

export const PINCH_THRESHOLD = 0.02;

export const FINGER_JOINTS: readonly XRHandJoint[] = [
	"thumb-metacarpal",
	"thumb-phalanx-proximal",
	"thumb-phalanx-distal",
	"thumb-tip",
	"index-finger-metacarpal",
	"index-finger-phalanx-proximal",
	"index-finger-phalanx-intermediate",
	"index-finger-phalanx-distal",
	"index-finger-tip",
	"middle-finger-metacarpal",
	"middle-finger-phalanx-proximal",
	"middle-finger-phalanx-intermediate",
	"middle-finger-phalanx-distal",
	"middle-finger-tip",
	"ring-finger-metacarpal",
	"ring-finger-phalanx-proximal",
	"ring-finger-phalanx-intermediate",
	"ring-finger-phalanx-distal",
	"ring-finger-tip",
	"pinky-finger-metacarpal",
	"pinky-finger-phalanx-proximal",
	"pinky-finger-phalanx-intermediate",
	"pinky-finger-phalanx-distal",
	"pinky-finger-tip",
] as const;

export const ALL_JOINTS: readonly XRHandJoint[] = ["wrist", ...FINGER_JOINTS] as const;
