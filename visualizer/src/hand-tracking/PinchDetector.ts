import type { JointData, PinchState, Vec3 } from "./types";
import { PINCH_THRESHOLD } from "./types";

export interface PinchDetectorConfig {
	threshold: number;
}

const defaultConfig: PinchDetectorConfig = {
	threshold: PINCH_THRESHOLD,
};

export function createPinchDetector(configOverrides?: Partial<PinchDetectorConfig>) {
	const config = { ...defaultConfig, ...configOverrides };

	function detect(joints: Map<XRHandJoint, JointData>): PinchState {
		const thumbTip = joints.get("thumb-tip");
		const indexTip = joints.get("index-finger-tip");

		if (!thumbTip || !indexTip) {
			return { isPinching: false, distance: Number.POSITIVE_INFINITY };
		}

		const distance = vec3Distance(thumbTip.position, indexTip.position);
		return {
			isPinching: distance < config.threshold,
			distance,
		};
	}

	return { detect };
}

export function vec3Distance(a: Vec3, b: Vec3): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const dz = a.z - b.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
