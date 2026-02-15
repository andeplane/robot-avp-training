import type { HandPose } from "../hand-tracking/types";
import type { ArmAction } from "./types";

export interface HandToArmMapper {
	mapHandToAction(current: HandPose, previous: HandPose | null): ArmAction;
}

export interface HandToArmMapperConfig {
	translationScale: number;
	rotationScale: number;
}

const defaultConfig: HandToArmMapperConfig = {
	translationScale: 1.0,
	rotationScale: 1.0,
};

export function createHandToArmMapper(
	configOverrides?: Partial<HandToArmMapperConfig>,
): HandToArmMapper {
	const config = { ...defaultConfig, ...configOverrides };

	function mapHandToAction(current: HandPose, previous: HandPose | null): ArmAction {
		if (!previous) {
			return {
				dx: 0,
				dy: 0,
				dz: 0,
				droll: 0,
				dpitch: 0,
				dyaw: 0,
				gripper: current.pinchState.isPinching ? 0 : 1,
			};
		}

		const dx = (current.wristPosition.x - previous.wristPosition.x) * config.translationScale;
		const dy = (current.wristPosition.y - previous.wristPosition.y) * config.translationScale;
		const dz = (current.wristPosition.z - previous.wristPosition.z) * config.translationScale;

		const eulerCurrent = quaternionToEuler(current.wristOrientation);
		const eulerPrevious = quaternionToEuler(previous.wristOrientation);

		const droll = (eulerCurrent.roll - eulerPrevious.roll) * config.rotationScale;
		const dpitch = (eulerCurrent.pitch - eulerPrevious.pitch) * config.rotationScale;
		const dyaw = (eulerCurrent.yaw - eulerPrevious.yaw) * config.rotationScale;

		const gripper = current.pinchState.isPinching ? 0 : 1;

		return { dx, dy, dz, droll, dpitch, dyaw, gripper };
	}

	return { mapHandToAction };
}

interface EulerAngles {
	roll: number;
	pitch: number;
	yaw: number;
}

export function quaternionToEuler(q: { x: number; y: number; z: number; w: number }): EulerAngles {
	const sinrCosp = 2 * (q.w * q.x + q.y * q.z);
	const cosrCosp = 1 - 2 * (q.x * q.x + q.y * q.y);
	const roll = Math.atan2(sinrCosp, cosrCosp);

	const sinp = 2 * (q.w * q.y - q.z * q.x);
	const pitch = Math.abs(sinp) >= 1 ? (Math.sign(sinp) * Math.PI) / 2 : Math.asin(sinp);

	const sinyCosp = 2 * (q.w * q.z + q.x * q.y);
	const cosyCosp = 1 - 2 * (q.y * q.y + q.z * q.z);
	const yaw = Math.atan2(sinyCosp, cosyCosp);

	return { roll, pitch, yaw };
}
