import { createPinchDetector } from "./PinchDetector";
import type { HandPose, JointData } from "./types";
import { ALL_JOINTS } from "./types";

export interface HandTracker {
	update(frame: XRFrame, referenceSpace: XRReferenceSpace): Map<string, HandPose>;
	getLatestPoses(): Map<string, HandPose>;
}

export interface HandTrackerDependencies {
	getInputSources: (frame: XRFrame) => Iterable<XRInputSource>;
}

const defaultDependencies: HandTrackerDependencies = {
	getInputSources: (frame: XRFrame) => frame.session.inputSources,
};

export function createHandTracker(
	dependencyOverrides?: Partial<HandTrackerDependencies>,
): HandTracker {
	const deps = { ...defaultDependencies, ...dependencyOverrides };
	const pinchDetector = createPinchDetector();
	const latestPoses = new Map<string, HandPose>();

	function update(frame: XRFrame, referenceSpace: XRReferenceSpace): Map<string, HandPose> {
		latestPoses.clear();

		for (const inputSource of deps.getInputSources(frame)) {
			if (!inputSource.hand) continue;

			const handedness = inputSource.handedness;
			if (handedness !== "left" && handedness !== "right") continue;

			const pose = extractHandPose(frame, referenceSpace, inputSource.hand, handedness);
			if (pose) {
				latestPoses.set(handedness, pose);
			}
		}

		return latestPoses;
	}

	function extractHandPose(
		frame: XRFrame,
		referenceSpace: XRReferenceSpace,
		hand: XRHand,
		handedness: "left" | "right",
	): HandPose | null {
		const joints = new Map<XRHandJoint, JointData>();

		const getJointPose = frame.getJointPose?.bind(frame);
		if (!getJointPose) return null;

		for (const jointName of ALL_JOINTS) {
			const jointSpace = hand.get(jointName);
			if (!jointSpace) continue;

			const jointPose = getJointPose(jointSpace, referenceSpace);
			if (!jointPose) continue;

			joints.set(jointName, {
				position: {
					x: jointPose.transform.position.x,
					y: jointPose.transform.position.y,
					z: jointPose.transform.position.z,
				},
				orientation: {
					x: jointPose.transform.orientation.x,
					y: jointPose.transform.orientation.y,
					z: jointPose.transform.orientation.z,
					w: jointPose.transform.orientation.w,
				},
				radius: jointPose.radius ?? 0.005,
			});
		}

		if (joints.size === 0) return null;

		const wristJoint = joints.get("wrist");
		const wristPosition = wristJoint?.position ?? { x: 0, y: 0, z: 0 };
		const wristOrientation = wristJoint?.orientation ?? { x: 0, y: 0, z: 0, w: 1 };

		const pinchState = pinchDetector.detect(joints);

		return {
			handedness,
			timestamp: performance.now(),
			joints,
			pinchState,
			wristPosition,
			wristOrientation,
		};
	}

	function getLatestPoses(): Map<string, HandPose> {
		return latestPoses;
	}

	return { update, getLatestPoses };
}
