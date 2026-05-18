// Physics helpers for the "weighted" input tilt effects

/**
 * Given a string, compute how heavy it is (more chars = heavier).
 * Returns a rotation angle in degrees.
 */
export function getWeightTilt(text, maxAngle = 28) {
    const len = text.length;
    if (len === 0) return 0;
    // Tilt increases with length, caps at maxAngle
    return Math.min(len * 1.8, maxAngle);
}

/**
 * For the "hanging off the side" effect.
 * Once weight > threshold, the input starts sliding off to the right.
 * Returns a translateX percentage (0–100).
 */
export function getHangOffset(text, threshold = 12, maxOffset = 110) {
    const len = text.length;
    if (len <= threshold) return 0;
    const excess = len - threshold;
    return Math.min(excess * 9, maxOffset);
}

/**
 * Once it's really heavy, also drop it a bit (translateY in px).
 */
export function getDropOffset(text, threshold = 18, maxDrop = 60) {
    const len = text.length;
    if (len <= threshold) return 0;
    const excess = len - threshold;
    return Math.min(excess * 5, maxDrop);
}
